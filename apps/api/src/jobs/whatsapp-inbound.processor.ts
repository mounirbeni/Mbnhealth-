import { Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { CommunicationChannel, CommunicationDirection } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
import { AiBotService } from "../ai-bot/ai-bot.service";
import { WHATSAPP_INBOUND_QUEUE, WhatsAppInboundJobData } from "../queue/queue.constants";

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-9);
}

@Processor(WHATSAPP_INBOUND_QUEUE)
export class WhatsAppInboundProcessor extends WorkerHost {
  private readonly logger = new Logger("WhatsAppInboundProcessor");

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
    private readonly aiBot: AiBotService,
  ) {
    super();
  }

  async process(job: Job<WhatsAppInboundJobData>) {
    const { phoneNumberId, from, body, waMessageId } = job.data;

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
