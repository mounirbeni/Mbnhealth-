import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { AiBotModule } from "../ai-bot/ai-bot.module";
import { RemindersScheduler } from "./reminders.scheduler";
import { RemindersProcessor } from "./reminders.processor";
import { WhatsAppInboundProcessor } from "./whatsapp-inbound.processor";

@Module({
  imports: [ScheduleModule.forRoot(), WhatsAppModule, AiBotModule],
  providers: [RemindersScheduler, RemindersProcessor, WhatsAppInboundProcessor],
})
export class JobsModule {}
