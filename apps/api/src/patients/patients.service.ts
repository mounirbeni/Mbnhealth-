import { Injectable, NotFoundException } from "@nestjs/common";
import { AllergySeverity } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  AddAllergyDto,
  AddMedicationDto,
  AddVitalDto,
  CreatePatientDto,
  UpdatePatientDto,
} from "./dto/patient.dto";

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: { search?: string; page: number; pageSize: number }) {
    const where = {
      tenantId,
      ...(params.search
        ? {
            OR: [
              { firstName: { contains: params.search, mode: "insensitive" as const } },
              { lastName: { contains: params.search, mode: "insensitive" as const } },
              { mrn: { contains: params.search, mode: "insensitive" as const } },
              { phone: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: { _count: { select: { appointments: true, invoices: true } } },
      }),
      this.prisma.patient.count({ where }),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
      include: {
        allergies: true,
        medications: { orderBy: { startDate: "desc" } },
        vitals: { orderBy: { recordedAt: "desc" }, take: 10 },
        attachments: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!patient) throw new NotFoundException("Patient not found");
    return patient;
  }

  private async generateMrn(tenantId: string): Promise<string> {
    const count = await this.prisma.patient.count({ where: { tenantId } });
    return `MRN-${1000 + count + 1}`;
  }

  async create(tenantId: string, dto: CreatePatientDto) {
    const mrn = await this.generateMrn(tenantId);
    return this.prisma.patient.create({
      data: { ...dto, tenantId, mrn, dob: new Date(dto.dob) },
    });
  }

  async update(tenantId: string, id: string, dto: UpdatePatientDto) {
    await this.findOne(tenantId, id);
    return this.prisma.patient.update({
      where: { id },
      data: { ...dto, dob: dto.dob ? new Date(dto.dob) : undefined },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.patient.update({ where: { id }, data: { status: "INACTIVE" } });
    return { success: true };
  }

  async addAllergy(tenantId: string, patientId: string, dto: AddAllergyDto) {
    await this.findOne(tenantId, patientId);
    return this.prisma.allergy.create({
      data: {
        patientId,
        substance: dto.substance,
        reaction: dto.reaction,
        severity: (dto.severity as AllergySeverity) ?? AllergySeverity.MODERATE,
      },
    });
  }

  async removeAllergy(tenantId: string, patientId: string, allergyId: string) {
    await this.findOne(tenantId, patientId);
    await this.prisma.allergy.delete({ where: { id: allergyId } });
    return { success: true };
  }

  async addMedication(tenantId: string, patientId: string, dto: AddMedicationDto) {
    await this.findOne(tenantId, patientId);
    return this.prisma.medication.create({ data: { patientId, ...dto } });
  }

  async stopMedication(tenantId: string, patientId: string, medicationId: string) {
    await this.findOne(tenantId, patientId);
    return this.prisma.medication.update({
      where: { id: medicationId },
      data: { isActive: false, endDate: new Date() },
    });
  }

  async addVital(tenantId: string, patientId: string, dto: AddVitalDto, recordedById?: string) {
    await this.findOne(tenantId, patientId);
    let bmi: number | undefined;
    if (dto.weightKg && dto.heightCm) {
      const heightM = dto.heightCm / 100;
      bmi = Math.round((dto.weightKg / (heightM * heightM)) * 10) / 10;
    }
    return this.prisma.vitalSign.create({
      data: { patientId, ...dto, bmi, recordedById },
    });
  }

  /**
   * The unified EHR timeline: appointments, medical records, prescriptions,
   * lab/radiology orders, and invoices merged into one chronological feed.
   */
  async timeline(tenantId: string, patientId: string) {
    await this.findOne(tenantId, patientId);

    const [appointments, medicalRecords, prescriptions, labOrders, radiologyOrders, invoices] =
      await Promise.all([
        this.prisma.appointment.findMany({
          where: { tenantId, patientId },
          include: { doctor: { include: { user: true } } },
        }),
        this.prisma.medicalRecord.findMany({
          where: { tenantId, patientId },
          include: { doctor: { include: { user: true } }, diagnoses: true },
        }),
        this.prisma.prescription.findMany({
          where: { tenantId, patientId },
          include: { items: true, doctor: { include: { user: true } } },
        }),
        this.prisma.labOrder.findMany({ where: { tenantId, patientId } }),
        this.prisma.radiologyOrder.findMany({ where: { tenantId, patientId } }),
        this.prisma.invoice.findMany({ where: { tenantId, patientId } }),
      ]);

    type TimelineEvent = { type: string; date: Date; data: unknown };
    const events: TimelineEvent[] = [
      ...appointments.map((a) => ({ type: "appointment", date: a.startTime, data: a })),
      ...medicalRecords.map((m) => ({ type: "medical_record", date: m.visitDate, data: m })),
      ...prescriptions.map((p) => ({ type: "prescription", date: p.issuedDate, data: p })),
      ...labOrders.map((l) => ({ type: "lab_order", date: l.orderedAt, data: l })),
      ...radiologyOrders.map((r) => ({ type: "radiology_order", date: r.orderedAt, data: r })),
      ...invoices.map((i) => ({ type: "invoice", date: i.issueDate, data: i })),
    ];

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    return events;
  }
}
