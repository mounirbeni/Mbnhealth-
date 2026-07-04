import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlanLimitsService } from "../../common/plan-limits/plan-limits.service";
import { AppointmentsService } from "../../appointments/appointments.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Injectable()
export class PatientBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointments: AppointmentsService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async create(patientAccountId: string, dto: CreateBookingDto) {
    const tenant = await this.prisma.tenant.findFirst({ where: { slug: dto.tenantSlug, status: "ACTIVE" } });
    if (!tenant) throw new NotFoundException("Clinic not found");

    const doctor = await this.prisma.doctor.findFirst({ where: { id: dto.doctorId, tenantId: tenant.id } });
    if (!doctor) throw new NotFoundException("Doctor not found at this clinic");

    const account = await this.prisma.patientAccount.findUniqueOrThrow({ where: { id: patientAccountId } });

    const patientId = await this.resolvePatientId(patientAccountId, tenant.id, account, dto);

    // AppointmentsService.create() is written for the staff-facing API and
    // includes the full doctor.user row (passwordHash, mfaSecret, roleId...)
    // — never return that object as-is from a public endpoint. Re-select a
    // safe shape instead of trusting the internal method's include.
    const created = await this.appointments.create(
      tenant.id,
      {
        patientId,
        doctorId: dto.doctorId,
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
      },
      undefined,
    );

    return this.prisma.appointment.findUniqueOrThrow({
      where: { id: created.id },
      select: {
        id: true,
        status: true,
        type: true,
        startTime: true,
        endTime: true,
        reason: true,
        doctor: {
          select: {
            id: true,
            specialization: true,
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  private async resolvePatientId(
    patientAccountId: string,
    tenantId: string,
    account: { firstName: string; lastName: string; email: string; phone: string | null; dob: Date | null },
    dto: CreateBookingDto,
  ): Promise<string> {
    const existingLink = await this.prisma.patientAccountLink.findUnique({
      where: { patientAccountId_tenantId: { patientAccountId, tenantId } },
    });
    if (existingLink) return existingLink.patientId;

    await this.planLimits.assertWithinLimit(tenantId, "patients");

    const dob = dto.dob ? new Date(dto.dob) : account.dob;
    if (!dob) throw new BadRequestException("Date of birth is required to book with a new clinic");

    const count = await this.prisma.patient.count({ where: { tenantId } });
    const patient = await this.prisma.patient.create({
      data: {
        tenantId,
        mrn: `MRN-${1000 + count + 1}`,
        firstName: account.firstName,
        lastName: account.lastName,
        dob,
        phone: dto.phone ?? account.phone,
        email: account.email,
      },
    });
    await this.prisma.patientAccountLink.create({
      data: { patientAccountId, tenantId, patientId: patient.id },
    });
    return patient.id;
  }

  async myBookings(patientAccountId: string) {
    const links = await this.prisma.patientAccountLink.findMany({
      where: { patientAccountId },
      include: { tenant: { select: { name: true, slug: true, logoUrl: true } } },
    });

    return Promise.all(
      links.map(async (link) => ({
        clinic: link.tenant,
        appointments: await this.prisma.appointment.findMany({
          where: { tenantId: link.tenantId, patientId: link.patientId },
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          orderBy: { startTime: "desc" },
        }),
      })),
    );
  }
}
