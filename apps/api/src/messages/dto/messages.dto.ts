import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { CommunicationChannel } from "@mbn/database";

export class CreateThreadDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsArray()
  @IsString({ each: true })
  participantIds!: string[];
}

export class SendMessageDto {
  @IsString()
  body!: string;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsEnum(CommunicationChannel)
  channel!: CommunicationChannel;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  body!: string;
}

/** Manual email send from Messages > Templates. WhatsApp sends go through
 * the dedicated /whatsapp/send endpoint (see whatsapp module) since that
 * channel needs a real Meta Graph API call, not a generic log entry. */
export class SendEmailDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsString()
  message!: string;

  @IsString()
  recipient!: string;
}
