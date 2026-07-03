import { Module } from "@nestjs/common";
import { AiBotModule } from "../ai-bot/ai-bot.module";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppInboundService } from "./whatsapp-inbound.service";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppWebhookController } from "./whatsapp-webhook.controller";

@Module({
  imports: [AiBotModule],
  providers: [WhatsAppService, WhatsAppInboundService],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
