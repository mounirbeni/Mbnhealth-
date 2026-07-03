import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("unreadOnly") unreadOnly?: string) {
    return this.notificationsService.findAllForUser(user.tenantId!, user.userId, unreadOnly === "true");
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.unreadCount(user.tenantId!, user.userId);
  }

  @Patch(":id/read")
  markRead(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.notificationsService.markRead(user.tenantId!, user.userId, id);
  }

  @Patch("read-all")
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllRead(user.tenantId!, user.userId);
  }
}
