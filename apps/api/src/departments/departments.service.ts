import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDepartmentDto, UpdateDepartmentDto } from "./dto/department.dto";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenantId },
      include: { _count: { select: { doctors: true, appointments: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const department = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!department) throw new NotFoundException("Department not found");
    return department;
  }

  create(tenantId: string, dto: CreateDepartmentDto) {
    return this.prisma.department.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: UpdateDepartmentDto) {
    await this.findOne(tenantId, id);
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }
}
