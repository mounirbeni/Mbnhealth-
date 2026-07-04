import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AppointmentStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateAppointmentDto,
  CreateWaitlistEntryDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from "./dto/appointment.dto";

export const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.WAITING,
  AppointmentStatus.CHECKED_IN,
  AppointmentStatus.IN_CONSULTATION,
  AppointmentStatus.EMERGENCY,
];

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  CONFIRMED: ["WAITING", "CHECKED_IN", "CANCELLED", "NO_SHOW", "EMERGENCY"],
  WAITING: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["IN_CONSULTATION", "CANCELLED"],
  IN_CONSULTATION: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["CONFIRMED"],
  NO_SHOW: ["CONFIRMED"],
  EMERGENCY: ["IN_CONSULTATION", "COMPLETED", "CANCELLED"],
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    params: { from?: Date; to?: Date; doctorId?: string; patientId?: string; status?: AppointmentStatus },
  ) {
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId: params.doctorId,
        patientId: params.patientId,
        status: params.status,
        ...(params.from || params.to
          ? {
              startTime: {
                gte: params.from,
                lte: params.to,
              },
            }
          : {}),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        department: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        department: true,
        medicalRecord: true,
      },
    });
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  private async assertNoConflict(
    tenantId: string,
    doctorId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    if (endTime <= startTime) {
      throw new BadRequestException("Appointment end time must be after start time");
    }
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        doctorId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });
    if (conflict) {
      throw new ConflictException("This doctor already has an appointment in that time slot");
    }
  }

  async create(tenantId: string, dto: CreateAppointmentDto, createdById?: string) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    await this.assertNoConflict(tenantId, dto.doctorId, startTime, endTime);

    return this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        departmentId: dto.departmentId,
        type: dto.type,
        reason: dto.reason,
        notes: dto.notes,
        isRecurring: dto.isRecurring ?? false,
        recurrenceRule: dto.recurrenceRule,
        startTime,
        endTime,
        createdById,
      },
      include: { patient: true, doctor: { include: { user: true } } },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAppointmentDto) {
    const existing = await this.findOne(tenantId, id);
    const startTime = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    const doctorId = dto.doctorId ?? existing.doctorId;

    if (dto.startTime || dto.endTime || dto.doctorId) {
      await this.assertNoConflict(tenantId, doctorId, startTime, endTime, id);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { ...dto, startTime, endTime, doctorId },
      include: { patient: true, doctor: { include: { user: true } } },
    });
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateAppointmentStatusDto) {
    const existing = await this.findOne(tenantId, id);
    const allowed = VALID_TRANSITIONS[existing.status] ?? [];
    if (existing.status !== dto.status && !allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${existing.status} to ${dto.status}`);
    }

    const data: Record<string, unknown> = { status: dto.status };
    if (dto.status === AppointmentStatus.CHECKED_IN) data.checkedInAt = new Date();
    if (dto.status === AppointmentStatus.CANCELLED) {
      data.cancelledAt = new Date();
      data.cancelReason = dto.cancelReason;
    }

    return this.prisma.appointment.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED, cancelledAt: new Date() },
    });
    return { success: true };
  }

  // ── Waitlist ────────────────────────────────────────────────────────────
  async listWaitlist(tenantId: string) {
    return this.prisma.waitlistEntry.findMany({
      where: { tenantId },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async addToWaitlist(tenantId: string, dto: CreateWaitlistEntryDto) {
    return this.prisma.waitlistEntry.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  async removeFromWaitlist(tenantId: string, id: string) {
    await this.prisma.waitlistEntry.deleteMany({ where: { id, tenantId } });
    return { success: true };
  }
}
