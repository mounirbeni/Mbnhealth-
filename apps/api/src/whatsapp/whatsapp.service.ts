import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommunicationChannel, CommunicationDirection } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertWhatsAppConfigDto } from "./dto/whatsapp-config.dto";

export interface SendResult {
  status: "SENT" | "SIMULATED" | "FAILED";
  externalMessageId?: string;
  error?: string;
}

/**
 * Thin wrapper around the Meta WhatsApp Business Cloud API.
 *
 * Each tenant configures its own phone number ID + access token (obtained
 * from their own Meta Business account) via Settings > WhatsApp Bot. When a
 * tenant hasn't configured (or has deactivated) WhatsApp, sends are logged
 * as SIMULATED and recorded in CommunicationLog exactly like a real send,
 * so the rest of the product (reminders, conversation history) works
 * end-to-end without a live Meta account.
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger("WhatsApp");

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private graphUrl(phoneNumberId: string, path: string) {
    const version = this.config.get<string>("whatsapp.graphApiVersion");
    return `https://graph.facebook.com/${version}/${phoneNumberId}/${path}`;
  }

  async getConfig(tenantId: string) {
    return this.prisma.whatsAppConfig.findUnique({ where: { tenantId } });
  }

  /** Safe to return to the frontend: never leaks the raw access token. */
  async getConfigForDisplay(tenantId: string) {
    const config = await this.getConfig(tenantId);
    if (!config) return null;
    const { accessToken, ...rest } = config;
    return { ...rest, accessTokenPreview: `••••${accessToken.slice(-4)}` };
  }

  async getConfigByPhoneNumberId(phoneNumberId: string) {
    return this.prisma.whatsAppConfig.findUnique({
      where: { phoneNumberId },
      include: { tenant: true },
    });
  }

  async upsertConfig(tenantId: string, dto: UpsertWhatsAppConfigDto) {
    const existingOnAnotherTenant = await this.prisma.whatsAppConfig.findFirst({
      where: { phoneNumberId: dto.phoneNumberId, tenantId: { not: tenantId } },
    });
    if (existingOnAnotherTenant) {
      throw new BadRequestException("This WhatsApp phone number is already linked to another clinic");
    }

    return this.prisma.whatsAppConfig.upsert({
      where: { tenantId },
      update: dto,
      create: { tenantId, ...dto },
    });
  }

  /** Sends a freeform text message. Only valid within Meta's 24h customer
   * service window (i.e. replying to a message the patient sent recently).
   * For clinic-initiated reminders outside that window, use sendTemplate. */
  async sendText(tenantId: string, to: string, body: string): Promise<SendResult> {
    const config = await this.getConfig(tenantId);
    if (!config || !config.isActive) {
      this.logger.log(`[SIMULATED text] tenant=${tenantId} to=${to}: ${body.slice(0, 120)}`);
      return { status: "SIMULATED" };
    }

    try {
      const res = await fetch(this.graphUrl(config.phoneNumberId, "messages"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        this.logger.error(`Send failed: ${JSON.stringify(data)}`);
        return { status: "FAILED", error: data?.error?.message ?? "Unknown error" };
      }
      return { status: "SENT", externalMessageId: data?.messages?.[0]?.id };
    } catch (err) {
      this.logger.error(`Send threw: ${(err as Error).message}`);
      return { status: "FAILED", error: (err as Error).message };
    }
  }

  /** Sends a pre-approved template message — required for clinic-initiated
   * messages (like appointment reminders) outside the 24h response window.
   * The template must already exist and be approved in the tenant's Meta
   * Business Manager; `templateName` must match it exactly. */
  async sendTemplate(
    tenantId: string,
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams: string[],
  ): Promise<SendResult> {
    const config = await this.getConfig(tenantId);
    if (!config || !config.isActive) {
      this.logger.log(
        `[SIMULATED template=${templateName}] tenant=${tenantId} to=${to} params=${bodyParams.join(", ")}`,
      );
      return { status: "SIMULATED" };
    }

    try {
      const res = await fetch(this.graphUrl(config.phoneNumberId, "messages"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: bodyParams.length
              ? [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }]
              : undefined,
          },
        }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        this.logger.error(`Template send failed: ${JSON.stringify(data)}`);
        return { status: "FAILED", error: data?.error?.message ?? "Unknown error" };
      }
      return { status: "SENT", externalMessageId: data?.messages?.[0]?.id };
    } catch (err) {
      this.logger.error(`Template send threw: ${(err as Error).message}`);
      return { status: "FAILED", error: (err as Error).message };
    }
  }

  /** Sends a manual message from staff to a patient and logs it. */
  async sendManualMessage(tenantId: string, to: string, message: string, patientId?: string) {
    const result = await this.sendText(tenantId, to, message);
    return this.prisma.communicationLog.create({
      data: {
        tenantId,
        patientId,
        channel: CommunicationChannel.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        externalContact: to,
        externalMessageId: result.externalMessageId,
        content: message,
        status: result.status,
      },
    });
  }

  async findConversation(tenantId: string, patientId?: string, contact?: string) {
    return this.prisma.communicationLog.findMany({
      where: {
        tenantId,
        channel: CommunicationChannel.WHATSAPP,
        patientId,
        externalContact: contact,
      },
      orderBy: { sentAt: "asc" },
      take: 200,
    });
  }

  async findAllConversations(tenantId: string) {
    const logs = await this.prisma.communicationLog.findMany({
      where: { tenantId, channel: CommunicationChannel.WHATSAPP },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { sentAt: "desc" },
      take: 500,
    });
    const byContact = new Map<string, (typeof logs)[number][]>();
    for (const log of logs) {
      const key = log.externalContact ?? "unknown";
      if (!byContact.has(key)) byContact.set(key, []);
      byContact.get(key)!.push(log);
    }
    return Array.from(byContact.entries()).map(([contact, messages]) => ({
      contact,
      patient: messages.find((m) => m.patient)?.patient ?? null,
      lastMessage: messages[0],
      messageCount: messages.length,
    }));
  }
}
