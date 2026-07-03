import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { REMINDERS_QUEUE, WHATSAPP_INBOUND_QUEUE } from "./queue.constants";

/**
 * Registers BullMQ (backed by Redis) once for the whole app. Marked
 * @Global so any feature module can @InjectQueue(...) these two queues
 * without re-importing this module — this is what makes the reminder
 * cron job and the WhatsApp webhook non-blocking: both just enqueue work
 * and return immediately, and a worker processes it out-of-band.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>("redis.url"),
        },
      }),
    }),
    BullModule.registerQueue({ name: REMINDERS_QUEUE }, { name: WHATSAPP_INBOUND_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
