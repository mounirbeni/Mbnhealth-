import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { WhatsAppService } from "./whatsapp.service";
import { UpsertWhatsAppConfigDto, SendWhatsAppMessageDto } from "./dto/whatsapp-config.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("whatsapp")
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get("config")
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  getConfig(@CurrentUser() user: AuthenticatedUser) {
    return this.whatsAppService.getConfigForDisplay(user.tenantId!);
  }

  @Post("config")
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  @AuditLog("WhatsAppConfig")
  upsertConfig(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertWhatsAppConfigDto) {
    return this.whatsAppService.upsertConfig(user.tenantId!, dto);
  }

  @Get("conversations")
  @RequirePermissions(Permission.MESSAGES_READ)
  conversations(@CurrentUser() user: AuthenticatedUser) {
    return this.whatsAppService.findAllConversations(user.tenantId!);
  }

  @Get("conversations/:contact")
  @RequirePermissions(Permission.MESSAGES_READ)
  conversation(
    @CurrentUser() user: AuthenticatedUser,
    @Param("contact") contact: string,
    @Query("patientId") patientId?: string,
  ) {
    return this.whatsAppService.findConversation(user.tenantId!, patientId, contact);
  }

  @Post("send")
  @RequirePermissions(Permission.MESSAGES_WRITE)
  send(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendWhatsAppMessageDto) {
    return this.whatsAppService.sendManualMessage(user.tenantId!, dto.to, dto.message, dto.patientId);
  }
}
