import { Injectable, NotFoundException } from "@nestjs/common";
import { PrescriptionStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePrescriptionDto } from "./dto/prescription.dto";

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, params: { patientId?: string; status?: PrescriptionStatus }) {
    return this.prisma.prescription.findMany({
      where: { tenantId, patientId: params.patientId, status: params.status },
      include: {
        items: true,
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        patient: { select: { firstName: true, lastName: true, mrn: true } },
      },
      orderBy: { issuedDate: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, tenantId },
      include: { items: true, doctor: { include: { user: true } }, patient: true },
    });
    if (!prescription) throw new NotFoundException("Prescription not found");
    return prescription;
  }

  create(tenantId: string, dto: CreatePrescriptionDto) {
    return this.prisma.prescription.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        medicalRecordId: dto.medicalRecordId,
        notes: dto.notes,
        items: { create: dto.items },
      },
      include: { items: true },
    });
  }

  async cancel(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.CANCELLED },
    });
  }

  async complete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.COMPLETED },
    });
  }
}
