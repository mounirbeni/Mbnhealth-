import { Injectable, Logger } from "@nestjs/common";
import { AppointmentStatus, CommunicationChannel, CommunicationDirection } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";

const REMINDER_WINDOW_HOURS = 24;

/**
 * Runs synchronously inside an HTTP request (invoked by Vercel Cron once an
 * hour) rather than via a persistent BullMQ worker, since serverless
 * functions don't keep a background process alive between invocations.
 * Appointments are processed sequentially and `reminderSentAt` is set
 * immediately after each send, so a slow/failed send for one appointment
 * can't cause a duplicate reminder for another, and a retried cron
 * invocation naturally skips everything already sent.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger("RemindersService");

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  async runDueReminders(): Promise<{ processed: number }> {
    const windowEnd = new Date(Date.now() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        reminderSentAt: null,
        startTime: { gte: new Date(), lte: windowEnd },
        status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.WAITING, AppointmentStatus.CHECKED_IN] },
      },
      select: { id: true },
    });

    for (const appointment of appointments) {
      await this.sendReminder(appointment.id);
    }

    if (appointments.length > 0) {
      this.logger.log(`Processed ${appointments.length} appointment reminder(s)`);
    }
    return { processed: appointments.length };
  }

  private async sendReminder(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: { include: { user: true } } },
    });

    if (!appointment || appointment.reminderSentAt) return;
    if (!appointment.patient.phone) {
      this.logger.warn(`Skipping reminder for appointment ${appointment.id}: patient has no phone on file`);
      return;
    }

    // Mark as sent before sending: a slow/timing-out Vercel Cron invocation
    // can be retried, and this ensures a retry never double-sends.
    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderSentAt: new Date() },
    });

    const dateStr = appointment.startTime.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const timeStr = appointment.startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    // "appointment_reminder" must be created and approved in the tenant's
    // Meta Business Manager ahead of time — template messages are the only
    // way to message a patient outside the 24h customer-service window.
    const result = await this.whatsapp.sendTemplate(
      appointment.tenantId,
      appointment.patient.phone,
      "appointment_reminder",
      "en",
      [appointment.patient.firstName, `Dr. ${appointment.doctor.user.lastName}`, dateStr, timeStr],
    );

    await this.prisma.communicationLog.create({
      data: {
        tenantId: appointment.tenantId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        channel: CommunicationChannel.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        externalContact: appointment.patient.phone,
        externalMessageId: result.externalMessageId,
        content: `Appointment reminder for ${dateStr} ${timeStr} with Dr. ${appointment.doctor.user.lastName}`,
        status: result.status,
      },
    });
  }
}
