import { Module } from "@nestjs/common";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { RemindersService } from "./reminders.service";
import { RemindersController } from "./reminders.controller";

@Module({
  imports: [WhatsAppModule],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
