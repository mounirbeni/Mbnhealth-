import { Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { CommunicationChannel, CommunicationDirection } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
import { REMINDERS_QUEUE, SendReminderJobData } from "../queue/queue.constants";

@Processor(REMINDERS_QUEUE)
export class RemindersProcessor extends WorkerHost {
  private readonly logger = new Logger("RemindersProcessor");

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
  ) {
    super();
  }

  async process(job: Job<SendReminderJobData>) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: job.data.appointmentId },
      include: { patient: true, doctor: { include: { user: true } } },
    });

    if (!appointment || appointment.reminderSentAt) return;
    if (!appointment.patient.phone) {
      this.logger.warn(`Skipping reminder for appointment ${appointment.id}: patient has no phone on file`);
      return;
    }

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

    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderSentAt: new Date() },
    });
  }
}
