import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Super Admins act at the platform level and have no tenant of their own,
  // so there is no tenant-scoped notification feed to query for them.
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("unreadOnly") unreadOnly?: string) {
    if (!user.tenantId) return [];
    return this.notificationsService.findAllForUser(user.tenantId, user.userId, unreadOnly === "true");
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    if (!user.tenantId) return { count: 0 };
    return this.notificationsService.unreadCount(user.tenantId, user.userId);
  }

  @Patch(":id/read")
  markRead(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.notificationsService.markRead(user.tenantId!, user.userId, id);
  }

  @Patch("read-all")
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    if (!user.tenantId) return { success: true };
    return this.notificationsService.markAllRead(user.tenantId, user.userId);
  }
}
