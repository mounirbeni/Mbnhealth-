import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return lines.join("\n");
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async revenueReport(tenantId: string, from: Date, to: Date) {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId, paidAt: { gte: from, lte: to }, status: "COMPLETED" },
      include: { invoice: { include: { patient: true } } },
      orderBy: { paidAt: "desc" },
    });
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return {
      total,
      count: payments.length,
      payments: payments.map((p) => ({
        date: p.paidAt,
        patient: `${p.invoice.patient.firstName} ${p.invoice.patient.lastName}`,
        invoiceNumber: p.invoice.invoiceNumber,
        amount: Number(p.amount),
        method: p.method,
      })),
    };
  }

  async appointmentsReport(tenantId: string, from: Date, to: Date) {
    const appointments = await this.prisma.appointment.findMany({
      where: { tenantId, startTime: { gte: from, lte: to } },
      include: { patient: true, doctor: { include: { user: true } } },
    });
    const byStatus: Record<string, number> = {};
    for (const a of appointments) byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
    return { total: appointments.length, byStatus, appointments };
  }

  async patientsReport(tenantId: string) {
    const total = await this.prisma.patient.count({ where: { tenantId } });
    const byGender = await this.prisma.patient.groupBy({
      by: ["gender"],
      where: { tenantId },
      _count: true,
    });
    return { total, byGender };
  }

  async doctorsReport(tenantId: string) {
    const doctors = await this.prisma.doctor.findMany({
      where: { tenantId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        department: true,
        _count: { select: { appointments: true, medicalRecords: true } },
      },
    });
    return doctors.map((d) => ({
      name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
      department: d.department?.name,
      appointments: d._count.appointments,
      consultations: d._count.medicalRecords,
    }));
  }

  async financialSummary(tenantId: string, from: Date, to: Date) {
    const [revenue, outstanding, claims] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { tenantId, paidAt: { gte: from, lte: to }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } },
        _sum: { totalAmount: true, paidAmount: true },
      }),
      this.prisma.insuranceClaim.aggregate({
        where: { tenantId, submittedAt: { gte: from, lte: to } },
        _sum: { claimAmount: true, approvedAmount: true },
      }),
    ]);
    return {
      revenue: Number(revenue._sum.amount ?? 0),
      outstanding: Number(outstanding._sum.totalAmount ?? 0) - Number(outstanding._sum.paidAmount ?? 0),
      insuranceClaimed: Number(claims._sum.claimAmount ?? 0),
      insuranceApproved: Number(claims._sum.approvedAmount ?? 0),
    };
  }

  async inventoryReport(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({ where: { tenantId } });
    return {
      totalItems: items.length,
      lowStockCount: items.filter((i) => i.quantity <= i.reorderLevel).length,
      totalValue: items.reduce((sum, i) => sum + i.quantity * Number(i.unitCost ?? 0), 0),
      items,
    };
  }

  async exportCsv(tenantId: string, report: "revenue" | "appointments" | "patients", from: Date, to: Date) {
    if (report === "revenue") {
      const data = await this.revenueReport(tenantId, from, to);
      return toCsv(data.payments as any);
    }
    if (report === "appointments") {
      const data = await this.appointmentsReport(tenantId, from, to);
      return toCsv(
        data.appointments.map((a) => ({
          date: a.startTime,
          patient: `${a.patient.firstName} ${a.patient.lastName}`,
          doctor: `${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
          status: a.status,
          type: a.type,
        })),
      );
    }
    const patients = await this.prisma.patient.findMany({ where: { tenantId } });
    return toCsv(
      patients.map((p) => ({
        mrn: p.mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        dob: p.dob.toISOString().slice(0, 10),
        phone: p.phone,
        email: p.email,
      })),
    );
  }
}
