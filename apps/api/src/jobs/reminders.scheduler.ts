import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { AppointmentStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { REMINDERS_QUEUE, SendReminderJobData } from "../queue/queue.constants";

const REMINDER_WINDOW_HOURS = 24;

/** Every hour, finds appointments starting in the next 24h that haven't had
 * a reminder sent yet and enqueues one reminder job per appointment. The
 * job id is derived from the appointment id so BullMQ itself won't queue a
 * duplicate even if this runs twice before the first job flips
 * `reminderSentAt` (belt-and-suspenders alongside the DB check). */
@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger("RemindersScheduler");

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(REMINDERS_QUEUE) private readonly queue: Queue<SendReminderJobData>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async enqueueDueReminders() {
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
      await this.queue.add(
        "send-reminder",
        { appointmentId: appointment.id },
        { jobId: `reminder-${appointment.id}`, removeOnComplete: true, removeOnFail: 50 },
      );
    }

    if (appointments.length > 0) {
      this.logger.log(`Enqueued ${appointments.length} appointment reminder(s)`);
    }
  }
}
