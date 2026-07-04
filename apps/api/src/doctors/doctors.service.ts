import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { SystemRoleName } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/plan-limits/plan-limits.service";
import { CreateDoctorDto, UpdateDoctorDto } from "./dto/doctor.dto";

@Injectable()
export class DoctorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  findAll(tenantId: string, params: { departmentId?: string; search?: string }) {
    return this.prisma.doctor.findMany({
      where: {
        tenantId,
        departmentId: params.departmentId,
        ...(params.search
          ? {
              user: {
                is: {
                  OR: [
                    { firstName: { contains: params.search, mode: "insensitive" } },
                    { lastName: { contains: params.search, mode: "insensitive" } },
                  ],
                },
              },
            }
          : {}),
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, isActive: true } }, department: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { id, tenantId },
      include: { user: true, department: true },
    });
    if (!doctor) throw new NotFoundException("Doctor not found");
    return doctor;
  }

  async create(tenantId: string, dto: CreateDoctorDto) {
    await this.planLimits.assertWithinLimit(tenantId, "doctors");

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException("A user with this email already exists");

    const doctorRole = await this.prisma.role.findFirst({
      where: { tenantId, systemRole: SystemRoleName.DOCTOR },
    });
    if (!doctorRole) throw new NotFoundException("Doctor role not configured for this tenant");

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          roleId: doctorRole.id,
        },
      });
      return tx.doctor.create({
        data: {
          tenantId,
          userId: user.id,
          departmentId: dto.departmentId,
          specialization: dto.specialization,
          licenseNumber: dto.licenseNumber,
          bio: dto.bio,
          consultationFee: dto.consultationFee,
          workingHours: dto.workingHours as any,
        },
        include: { user: true, department: true },
      });
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDoctorDto) {
    await this.findOne(tenantId, id);
    return this.prisma.doctor.update({
      where: { id },
      data: { ...dto, workingHours: dto.workingHours as any },
      include: { user: true, department: true },
    });
  }

  async remove(tenantId: string, id: string) {
    const doctor = await this.findOne(tenantId, id);
    await this.prisma.user.update({ where: { id: doctor.userId }, data: { isActive: false } });
    return { success: true };
  }

  async availability(tenantId: string, doctorId: string, from: Date, to: Date) {
    await this.findOne(tenantId, doctorId);
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId,
        startTime: { gte: from },
        endTime: { lte: to },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      select: { id: true, startTime: true, endTime: true, status: true },
      orderBy: { startTime: "asc" },
    });
  }
}
