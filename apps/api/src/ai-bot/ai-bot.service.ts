import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { AppointmentStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";

export interface AiBotContext {
  tenantId: string;
  patientId: string | null;
  userMessage: string;
}

export interface AiBotReply {
  text: string;
  usedAi: boolean;
}

const MAX_REPLY_CHARS = 500;
const MAX_TOOL_ROUNDS = 3;

/**
 * A deliberately limited-capability WhatsApp assistant.
 *
 * It can only do two things: answer general clinic FAQ (hours, address,
 * services) and look up the *matched* patient's own upcoming appointments
 * (read-only). It cannot book, reschedule, or cancel anything, cannot see
 * other patients' data, and never gives medical advice — anything outside
 * that scope gets a short "a staff member will follow up" reply instead of
 * a model-generated answer, by design rather than by prompting alone: the
 * tools it can call simply don't expose write access or other patients.
 */
@Injectable()
export class AiBotService {
  private readonly logger = new Logger("AiBot");
  private client: Anthropic | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getClient(): Anthropic | null {
    const apiKey = this.config.get<string>("ai.anthropicApiKey");
    if (!apiKey) return null;
    if (!this.client) this.client = new Anthropic({ apiKey });
    return this.client;
  }

  async reply(ctx: AiBotContext): Promise<AiBotReply> {
    const client = this.getClient();
    if (!client) {
      return {
        usedAi: false,
        text: "Thanks for your message! One of our staff will get back to you shortly.",
      };
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: ctx.tenantId } });
    if (!tenant) {
      return { usedAi: false, text: "Sorry, we couldn't process your message right now." };
    }

    const tools: Anthropic.Tool[] = [
      {
        name: "get_clinic_info",
        description: "Returns this clinic's name, address, phone number, email and business hours.",
        input_schema: { type: "object", properties: {} },
      },
    ];
    if (ctx.patientId) {
      tools.push({
        name: "get_upcoming_appointments",
        description:
          "Returns the patient's own upcoming appointments (date, time, doctor, status). Only ever returns this specific patient's data.",
        input_schema: { type: "object", properties: {} },
      });
    }

    const systemPrompt = [
      `You are a WhatsApp assistant for "${tenant.name}", a medical clinic.`,
      "You can only do two things: answer general questions about the clinic using get_clinic_info, and — only if a tool named get_upcoming_appointments is available to you — look up the patient's own upcoming appointments.",
      "You must NEVER: give medical advice or diagnosis, discuss any patient other than the one you're texting with, book/reschedule/cancel appointments, or make promises about billing, insurance, or medication.",
      "If the patient asks for anything outside those two capabilities, reply briefly that a staff member will follow up with them soon — do not try to help further.",
      "Keep every reply under 300 characters, friendly, and in the same language the patient wrote in (Arabic, French, or English).",
    ].join(" ");

    const messages: Anthropic.MessageParam[] = [{ role: "user", content: ctx.userMessage }];

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await client.messages.create({
          model: this.config.get<string>("ai.model")!,
          max_tokens: 400,
          system: systemPrompt,
          tools,
          messages,
        });

        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
        );

        if (toolUseBlocks.length === 0) {
          const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === "text")
            .map((b) => b.text)
            .join(" ")
            .trim();
          return { usedAi: true, text: text.slice(0, MAX_REPLY_CHARS) || "Sorry, I couldn't process that." };
        }

        messages.push({ role: "assistant", content: response.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const toolUse of toolUseBlocks) {
          const result = await this.executeTool(toolUse.name, tenant.id, ctx.patientId, tenant);
          toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
        }
        messages.push({ role: "user", content: toolResults });
      }

      return {
        usedAi: true,
        text: "Sorry, I'm having trouble answering that — a staff member will follow up with you soon.",
      };
    } catch (err) {
      this.logger.error(`AI bot error: ${(err as Error).message}`);
      return {
        usedAi: false,
        text: "Thanks for your message! One of our staff will get back to you shortly.",
      };
    }
  }

  private async executeTool(
    name: string,
    tenantId: string,
    patientId: string | null,
    tenant: { name: string; address: string | null; phone: string | null; email: string | null; settings: unknown },
  ): Promise<string> {
    if (name === "get_clinic_info") {
      const businessHours = (tenant.settings as Record<string, unknown> | null)?.businessHours;
      return JSON.stringify({
        name: tenant.name,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        businessHours: businessHours ?? "Not configured — advise the patient to call the clinic",
      });
    }

    if (name === "get_upcoming_appointments" && patientId) {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          tenantId,
          patientId,
          startTime: { gte: new Date() },
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.WAITING, AppointmentStatus.CHECKED_IN] },
        },
        include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
        orderBy: { startTime: "asc" },
        take: 3,
      });
      return JSON.stringify(
        appointments.map((a) => ({
          date: a.startTime.toISOString().slice(0, 10),
          time: a.startTime.toISOString().slice(11, 16),
          doctor: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
          status: a.status,
        })),
      );
    }

    return JSON.stringify({ error: "Tool not available" });
  }
}
