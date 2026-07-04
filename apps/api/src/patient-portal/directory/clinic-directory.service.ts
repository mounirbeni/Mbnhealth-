import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ACTIVE_APPOINTMENT_STATUSES } from "../../appointments/appointments.service";

const SLOT_MINUTES = 30;
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

@Injectable()
export class ClinicDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public clinic search — only ever returns ACTIVE clinics and safe, non-sensitive fields. */
  async search(params: { query?: string; specialty?: string }) {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: "ACTIVE",
        ...(params.query
          ? {
              OR: [
                { name: { contains: params.query, mode: "insensitive" as const } },
                { address: { contains: params.query, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(params.specialty
          ? { doctors: { some: { specialization: { contains: params.specialty, mode: "insensitive" as const } } } }
          : {}),
      },
      select: {
        slug: true,
        name: true,
        address: true,
        phone: true,
        logoUrl: true,
        primaryColor: true,
        doctors: { select: { specialization: true }, distinct: ["specialization"] },
        _count: { select: { doctors: true } },
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return tenants.map((t) => ({
      slug: t.slug,
      name: t.name,
      address: t.address,
      phone: t.phone,
      logoUrl: t.logoUrl,
      primaryColor: t.primaryColor,
      doctorCount: t._count.doctors,
      specialties: [...new Set(t.doctors.map((d) => d.specialization))],
    }));
  }

  /** Public clinic profile — doctors' names/specialties only, never staff emails/phones. */
  async getProfile(slug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug, status: "ACTIVE" },
      include: {
        departments: { select: { id: true, name: true, color: true } },
        doctors: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } }, department: true },
        },
      },
    });
    if (!tenant) throw new NotFoundException("Clinic not found");

    return {
      slug: tenant.slug,
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      website: tenant.website,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      timezone: tenant.timezone,
      departments: tenant.departments,
      doctors: tenant.doctors.map((d) => ({
        id: d.id,
        firstName: d.user.firstName,
        lastName: d.user.lastName,
        avatarUrl: d.user.avatarUrl,
        specialization: d.specialization,
        bio: d.bio,
        consultationFee: d.consultationFee,
        department: d.department ? { id: d.department.id, name: d.department.name } : null,
      })),
    };
  }

  async getAvailability(slug: string, doctorId: string, dateStr: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException("date must be in YYYY-MM-DD format");
    }
    const tenant = await this.prisma.tenant.findFirst({ where: { slug, status: "ACTIVE" } });
    if (!tenant) throw new NotFoundException("Clinic not found");

    const doctor = await this.prisma.doctor.findFirst({ where: { id: doctorId, tenantId: tenant.id } });
    if (!doctor) throw new NotFoundException("Doctor not found at this clinic");

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayKey = DAY_KEYS[dayStart.getUTCDay()];
    const hours = (doctor.workingHours as Record<string, [string, string]> | null)?.[dayKey];
    if (!hours) return { date: dateStr, slots: [] };

    const [openTime, closeTime] = hours;
    const slotStart = new Date(`${dateStr}T${openTime}:00.000Z`);
    const dayEnd = new Date(`${dateStr}T${closeTime}:00.000Z`);

    const existing = await this.prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        doctorId,
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
        startTime: { lt: dayEnd },
        endTime: { gt: slotStart },
      },
      select: { startTime: true, endTime: true },
    });

    const slots: { start: string; end: string }[] = [];
    const now = new Date();
    for (let t = new Date(slotStart); t < dayEnd; t = new Date(t.getTime() + SLOT_MINUTES * 60000)) {
      const end = new Date(t.getTime() + SLOT_MINUTES * 60000);
      if (end > dayEnd) break;
      const isPast = t < now;
      const isTaken = existing.some((a) => a.startTime < end && a.endTime > t);
      if (!isPast && !isTaken) {
        slots.push({ start: t.toISOString(), end: end.toISOString() });
      }
    }

    return { date: dateStr, slots };
  }
}
