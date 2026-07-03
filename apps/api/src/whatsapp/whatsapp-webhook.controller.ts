import { Body, Controller, Get, Headers, Logger, Post, Query, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { Public } from "../common/decorators/public.decorator";
import { WhatsAppInboundService } from "./whatsapp-inbound.service";

interface CloudApiWebhookPayload {
  entry?: {
    changes?: {
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { profile?: { name?: string } }[];
        messages?: { from: string; id: string; type: string; text?: { body: string } }[];
      };
    }[];
  }[];
}

/** Public, unauthenticated endpoint Meta calls directly — protected by the
 * webhook verify-token handshake (GET) and the X-Hub-Signature-256 HMAC
 * check (POST) instead of our normal JWT auth. */
@Controller("whatsapp/webhook")
export class WhatsAppWebhookController {
  private readonly logger = new Logger("WhatsAppWebhook");

  constructor(
    private readonly config: ConfigService,
    private readonly inboundService: WhatsAppInboundService,
  ) {}

  @Public()
  @Get()
  verify(@Query() query: Record<string, string>, @Res() res: Response) {
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];
    const expected = this.config.get<string>("whatsapp.webhookVerifyToken");

    if (mode === "subscribe" && expected && token === expected) {
      return res.status(200).send(challenge);
    }
    this.logger.warn("Webhook verification failed: token mismatch or not configured");
    return res.status(403).send("Forbidden");
  }

  @Public()
  @Post()
  async receive(
    @Req() req: Request & { rawBody?: Buffer },
    @Body() body: CloudApiWebhookPayload,
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Res() res: Response,
  ) {
    const appSecret = this.config.get<string>("whatsapp.appSecret");
    if (appSecret && !this.isValidSignature(req.rawBody, signature, appSecret)) {
      this.logger.warn("Rejected webhook payload with invalid signature");
      return res.status(401).send("Invalid signature");
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        for (const message of value?.messages ?? []) {
          // Limited capability by design: only free-text messages are
          // understood; media/location/interactive replies are ignored.
          if (message.type !== "text") continue;

          // Processed inline (no background worker in a serverless
          // deployment) before acking Meta; processMessage() is idempotent
          // on waMessageId so a Meta retry of this same request is safe.
          await this.inboundService.processMessage({
            phoneNumberId,
            from: message.from,
            body: message.text?.body ?? "",
            waMessageId: message.id,
          });
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  private isValidSignature(rawBody: Buffer | undefined, signatureHeader: string | undefined, appSecret: string): boolean {
    if (!rawBody || !signatureHeader) return false;
    const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
    } catch {
      return false;
    }
  }
}
