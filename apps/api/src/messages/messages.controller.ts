import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateTemplateDto, CreateThreadDto, SendCommunicationDto, SendMessageDto } from "./dto/messages.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("threads")
  findAllThreads(@CurrentUser() user: AuthenticatedUser) {
    return this.messagesService.findAllThreads(user.tenantId!, user.userId);
  }

  @Get("threads/:id")
  findThreadMessages(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.messagesService.findThreadMessages(user.tenantId!, id);
  }

  @Post("threads")
  createThread(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateThreadDto) {
    return this.messagesService.createThread(user.tenantId!, dto, user.userId);
  }

  @Post("threads/:id/messages")
  sendMessage(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(user.tenantId!, id, user.userId, dto.body);
  }

  @Get("templates")
  findAllTemplates(@CurrentUser() user: AuthenticatedUser) {
    return this.messagesService.findAllTemplates(user.tenantId!);
  }

  @Post("templates")
  createTemplate(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTemplateDto) {
    return this.messagesService.createTemplate(user.tenantId!, dto);
  }

  @Delete("templates/:id")
  deleteTemplate(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.messagesService.deleteTemplate(user.tenantId!, id);
  }

  @Get("logs")
  findAllLogs(@CurrentUser() user: AuthenticatedUser, @Query("patientId") patientId?: string) {
    return this.messagesService.findAllLogs(user.tenantId!, patientId);
  }

  @Post("send")
  send(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendCommunicationDto) {
    return this.messagesService.send(user.tenantId!, dto);
  }
}
