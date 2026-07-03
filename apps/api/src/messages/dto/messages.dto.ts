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

export class SendCommunicationDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsEnum(CommunicationChannel)
  channel!: CommunicationChannel;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsString()
  message!: string;

  @IsString()
  recipient!: string;
}
