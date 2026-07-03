import { Module } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppWebhookController } from "./whatsapp-webhook.controller";

@Module({
  providers: [WhatsAppService],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
