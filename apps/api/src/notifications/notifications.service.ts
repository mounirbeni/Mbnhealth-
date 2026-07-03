import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(tenantId: string, userId: string, unreadOnly?: boolean) {
    return this.prisma.notification.findMany({
      where: { tenantId, userId, isRead: unreadOnly ? false : undefined },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async unreadCount(tenantId: string, userId: string) {
    const count = await this.prisma.notification.count({ where: { tenantId, userId, isRead: false } });
    return { count };
  }

  async markRead(tenantId: string, userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({ where: { id, tenantId, userId } });
    if (!notif) throw new NotFoundException("Notification not found");
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(tenantId: string, userId: string) {
    await this.prisma.notification.updateMany({ where: { tenantId, userId, isRead: false }, data: { isRead: true } });
    return { success: true };
  }

  async create(tenantId: string, userId: string, title: string, body?: string, type = "INFO", link?: string) {
    return this.prisma.notification.create({ data: { tenantId, userId, title, body, type, link } });
  }
}
