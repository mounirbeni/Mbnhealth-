import { Injectable, Logger } from "@nestjs/common";
import { CommunicationChannel, CommunicationDirection } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "./whatsapp.service";
import { AiBotService } from "../ai-bot/ai-bot.service";

export interface InboundWhatsAppMessage {
  phoneNumberId: string;
  from: string;
  body: string;
  waMessageId: string;
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-9);
}

/**
 * Processes one inbound WhatsApp message synchronously, called directly
 * from the webhook controller. There's no background queue/worker here:
 * a serverless function has nothing to consume a queue with between
 * requests, so processing happens inline before the webhook responds to
 * Meta (which allows a generous window before it considers the delivery
 * failed and retries).
 */
@Injectable()
export class WhatsAppInboundService {
  private readonly logger = new Logger("WhatsAppInboundService");

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
    private readonly aiBot: AiBotService,
  ) {}

  async processMessage(data: InboundWhatsAppMessage): Promise<void> {
    const { phoneNumberId, from, body, waMessageId } = data;

    // Meta retries webhook delivery on a slow/failed ack; since there's no
    // queue to naturally dedupe by job id anymore, guard against
    // reprocessing (and double-replying to) the same message explicitly.
    const alreadyProcessed = await this.prisma.communicationLog.findFirst({
      where: { externalMessageId: waMessageId, direction: CommunicationDirection.INBOUND },
      select: { id: true },
    });
    if (alreadyProcessed) {
      this.logger.log(`Skipping already-processed inbound message ${waMessageId}`);
      return;
    }

    const config = await this.whatsapp.getConfigByPhoneNumberId(phoneNumberId);
    if (!config || !config.isActive) {
      this.logger.warn(`Dropping inbound message for unknown/inactive phone_number_id=${phoneNumberId}`);
      return;
    }
    const tenantId = config.tenantId;

    const patient = await this.matchPatientByPhone(tenantId, from);

    await this.prisma.communicationLog.create({
      data: {
        tenantId,
        patientId: patient?.id,
        channel: CommunicationChannel.WHATSAPP,
        direction: CommunicationDirection.INBOUND,
        externalContact: from,
        externalMessageId: waMessageId,
        content: body,
        status: "RECEIVED",
      },
    });

    if (!config.aiBotEnabled) {
      this.logger.log(`AI bot disabled for tenant ${tenantId}; leaving message ${waMessageId} for staff`);
      return;
    }

    const reply = await this.aiBot.reply({ tenantId, patientId: patient?.id ?? null, userMessage: body });
    const sendResult = await this.whatsapp.sendText(tenantId, from, reply.text);

    await this.prisma.communicationLog.create({
      data: {
        tenantId,
        patientId: patient?.id,
        channel: CommunicationChannel.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        externalContact: from,
        externalMessageId: sendResult.externalMessageId,
        content: reply.text,
        respondedByAi: reply.usedAi,
        status: sendResult.status,
      },
    });
  }

  // Simplification for demo scale: scans all of a tenant's patients with a
  // phone number rather than querying by a normalized/indexed column. Fine
  // for a few thousand patients; a clinic with a much larger patient base
  // should add a normalized-phone column with an index instead.
  private async matchPatientByPhone(tenantId: string, from: string) {
    const target = normalizePhone(from);
    const patients = await this.prisma.patient.findMany({
      where: { tenantId, phone: { not: null } },
      select: { id: true, phone: true },
    });
    return patients.find((p) => p.phone && normalizePhone(p.phone) === target) ?? null;
  }
}
