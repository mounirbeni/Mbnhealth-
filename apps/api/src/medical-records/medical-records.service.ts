import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MedicalRecordStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "./dto/medical-record.dto";

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForPatient(tenantId: string, patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { tenantId, patientId },
      include: { doctor: { include: { user: true } }, diagnoses: true, prescriptions: { include: { items: true } } },
      orderBy: { visitDate: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        diagnoses: true,
        prescriptions: { include: { items: true } },
      },
    });
    if (!record) throw new NotFoundException("Medical record not found");
    return record;
  }

  async create(tenantId: string, dto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentId: dto.appointmentId,
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        voiceNoteUrl: dto.voiceNoteUrl,
        status: MedicalRecordStatus.DRAFT,
        diagnoses: dto.diagnoses
          ? {
              create: dto.diagnoses.map((d) => ({
                icdCode: d.icdCode,
                description: d.description,
                isPrimary: d.isPrimary ?? false,
              })),
            }
          : undefined,
      },
      include: { diagnoses: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateMedicalRecordDto) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status === MedicalRecordStatus.FINALIZED) {
      throw new BadRequestException("Cannot edit a finalized record; use amend instead");
    }

    if (dto.diagnoses) {
      await this.prisma.diagnosis.deleteMany({ where: { medicalRecordId: id } });
    }

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        voiceNoteUrl: dto.voiceNoteUrl,
        diagnoses: dto.diagnoses
          ? {
              create: dto.diagnoses.map((d) => ({
                icdCode: d.icdCode,
                description: d.description,
                isPrimary: d.isPrimary ?? false,
              })),
            }
          : undefined,
      },
      include: { diagnoses: true },
    });
  }

  async finalize(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.medicalRecord.update({
      where: { id },
      data: { status: MedicalRecordStatus.FINALIZED },
    });
  }

  async amend(tenantId: string, id: string, dto: UpdateMedicalRecordDto) {
    await this.findOne(tenantId, id);
    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        status: MedicalRecordStatus.AMENDED,
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
      },
    });
  }
}
