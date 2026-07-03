import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { CompleteRadiologyOrderDto, CreateRadiologyOrderDto } from "./dto/radiology-order.dto";

@Injectable()
export class RadiologyService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, params: { status?: OrderStatus; patientId?: string }) {
    return this.prisma.radiologyOrder.findMany({
      where: { tenantId, status: params.status, patientId: params.patientId },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { orderedAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.radiologyOrder.findFirst({
      where: { id, tenantId },
      include: { patient: true },
    });
    if (!order) throw new NotFoundException("Radiology order not found");
    return order;
  }

  create(tenantId: string, dto: CreateRadiologyOrderDto) {
    return this.prisma.radiologyOrder.create({ data: { tenantId, ...dto } });
  }

  async start(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.radiologyOrder.update({ where: { id }, data: { status: OrderStatus.IN_PROGRESS } });
  }

  async complete(tenantId: string, id: string, dto: CompleteRadiologyOrderDto) {
    await this.findOne(tenantId, id);
    return this.prisma.radiologyOrder.update({
      where: { id },
      data: { status: OrderStatus.COMPLETED, completedAt: new Date(), ...dto },
    });
  }

  async cancel(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.radiologyOrder.update({ where: { id }, data: { status: OrderStatus.CANCELLED } });
  }
}
