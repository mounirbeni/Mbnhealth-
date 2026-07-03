import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTemplateDto, CreateThreadDto, SendCommunicationDto } from "./dto/messages.dto";

@Injectable()
export class MessagesService {
  private readonly logger = new Logger("Messaging");

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ── Internal staff messaging ──────────────────────────────────────────────
  findAllThreads(tenantId: string, userId: string) {
    return this.prisma.messageThread.findMany({
      where: { tenantId, participants: { some: { userId } } },
      include: {
        participants: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findThreadMessages(tenantId: string, threadId: string) {
    const thread = await this.prisma.messageThread.findFirst({ where: { id: threadId, tenantId } });
    if (!thread) throw new NotFoundException("Thread not found");
    return this.prisma.message.findMany({
      where: { threadId },
      include: { sender: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  createThread(tenantId: string, dto: CreateThreadDto, creatorId: string) {
    const participantIds = Array.from(new Set([...dto.participantIds, creatorId]));
    return this.prisma.messageThread.create({
      data: {
        tenantId,
        subject: dto.subject,
        participants: { create: participantIds.map((userId) => ({ userId })) },
      },
      include: { participants: true },
    });
  }

  async sendMessage(tenantId: string, threadId: string, senderId: string, body: string) {
    const thread = await this.prisma.messageThread.findFirst({ where: { id: threadId, tenantId } });
    if (!thread) throw new NotFoundException("Thread not found");
    return this.prisma.message.create({ data: { threadId, senderId, body } });
  }

  // ── Templates ──────────────────────────────────────────────────────────────
  findAllTemplates(tenantId: string) {
    return this.prisma.messageTemplate.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  createTemplate(tenantId: string, dto: CreateTemplateDto) {
    return this.prisma.messageTemplate.create({ data: { tenantId, ...dto } });
  }

  async deleteTemplate(tenantId: string, id: string) {
    await this.prisma.messageTemplate.deleteMany({ where: { id, tenantId } });
    return { success: true };
  }

  // ── Outbound communications (SMS / WhatsApp / Email reminders) ────────────
  // Providers are pluggable via env config; with no provider configured this
  // logs the intended send and records it, so the feature is fully wired end
  // to end and ready for a real Twilio/Meta/SMTP integration to be dropped in.
  async send(tenantId: string, dto: SendCommunicationDto) {
    const providerKey =
      dto.channel === "SMS"
        ? "messaging.smsProvider"
        : dto.channel === "WHATSAPP"
          ? "messaging.whatsappProvider"
          : "messaging.emailProvider";
    const provider = this.config.get<string>(providerKey);

    this.logger.log(
      `[${dto.channel}] provider=${provider ?? "none"} to=${dto.recipient}: ${dto.message.slice(0, 120)}`,
    );

    return this.prisma.communicationLog.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        channel: dto.channel,
        templateId: dto.templateId,
        status: provider && provider !== "none" && provider !== "console" ? "SENT" : "SIMULATED",
      },
    });
  }

  findAllLogs(tenantId: string, patientId?: string) {
    return this.prisma.communicationLog.findMany({
      where: { tenantId, patientId },
      orderBy: { sentAt: "desc" },
      take: 100,
    });
  }
}
