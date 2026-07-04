import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const DOCTOR_SELECT = { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } as const;

@Injectable()
export class PatientPortalService {
  constructor(private readonly prisma: PrismaService) {}

  appointments(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: DOCTOR_SELECT, department: true },
      orderBy: { startTime: "desc" },
    });
  }

  medicalRecords(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId, status: { in: ["FINALIZED", "AMENDED"] } },
      include: { doctor: DOCTOR_SELECT },
      orderBy: { visitDate: "desc" },
    });
  }

  prescriptions(patientId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId },
      include: { items: true, doctor: DOCTOR_SELECT },
      orderBy: { issuedDate: "desc" },
    });
  }

  invoices(patientId: string) {
    return this.prisma.invoice.findMany({
      where: { patientId, status: { not: "DRAFT" } },
      include: { items: true, payments: true },
      orderBy: { issueDate: "desc" },
    });
  }

  labOrders(patientId: string) {
    return this.prisma.labOrder.findMany({
      where: { patientId },
      include: { doctor: DOCTOR_SELECT },
      orderBy: { orderedAt: "desc" },
    });
  }

  radiologyOrders(patientId: string) {
    return this.prisma.radiologyOrder.findMany({
      where: { patientId },
      include: { doctor: DOCTOR_SELECT },
      orderBy: { orderedAt: "desc" },
    });
  }
}
