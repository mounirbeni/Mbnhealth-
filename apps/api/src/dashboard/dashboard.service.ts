import { Injectable } from "@nestjs/common";
import { AppointmentStatus, InvoiceStatus, PaymentStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(tenantId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      todayAppointments,
      totalPatients,
      totalDoctors,
      revenueAgg,
      outstandingAgg,
      pendingLabOrders,
      lowStockItems,
    ] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { tenantId, startTime: { gte: startOfToday, lte: endOfToday } },
        select: { status: true },
      }),
      this.prisma.patient.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.doctor.count({ where: { tenantId } }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: PaymentStatus.COMPLETED, paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        },
        _sum: { totalAmount: true, paidAmount: true },
      }),
      this.prisma.labOrder.count({ where: { tenantId, status: { in: ["ORDERED", "IN_PROGRESS"] } } }),
      this.prisma.$queryRaw<
        { count: bigint }[]
      >`SELECT COUNT(*) as count FROM inventory_items WHERE "tenantId" = ${tenantId} AND quantity <= "reorderLevel"`,
    ]);
    const lowStockItemsCount = Number(lowStockItems[0]?.count ?? 0);

    const appointmentsByStatus = Object.fromEntries(
      Object.values(AppointmentStatus).map((s) => [
        s,
        todayAppointments.filter((a) => a.status === s).length,
      ]),
    );

    return {
      todayAppointmentsTotal: todayAppointments.length,
      appointmentsByStatus,
      totalPatients,
      totalDoctors,
      revenueThisMonth: Number(revenueAgg._sum.amount ?? 0),
      outstandingBalance:
        Number(outstandingAgg._sum.totalAmount ?? 0) - Number(outstandingAgg._sum.paidAmount ?? 0),
      pendingLabOrders,
      lowStockItemsCount,
    };
  }

  async revenueTrend(tenantId: string, months = 6) {
    const now = new Date();
    const results: { month: string; revenue: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const agg = await this.prisma.payment.aggregate({
        where: { tenantId, status: PaymentStatus.COMPLETED, paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      results.push({
        month: start.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        revenue: Number(agg._sum.amount ?? 0),
      });
    }
    return results;
  }

  async appointmentsTrend(tenantId: string, days = 14) {
    const now = new Date();
    const results: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const count = await this.prisma.appointment.count({
        where: { tenantId, startTime: { gte: start, lte: end } },
      });
      results.push({ date: start.toISOString().slice(0, 10), count });
    }
    return results;
  }

  async upcomingAppointments(tenantId: string, limit = 10) {
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        startTime: { gte: new Date() },
        status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.WAITING] },
      },
      include: {
        patient: { select: { firstName: true, lastName: true, avatarUrl: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { startTime: "asc" },
      take: limit,
    });
  }

  async doctorPerformance(tenantId: string) {
    const doctors = await this.prisma.doctor.findMany({
      where: { tenantId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        _count: { select: { appointments: true } },
      },
    });
    return doctors.map((d) => ({
      doctorId: d.id,
      name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
      appointmentsCount: d._count.appointments,
    }));
  }
}
