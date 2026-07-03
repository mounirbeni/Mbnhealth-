import { Injectable, NotFoundException } from "@nestjs/common";
import { InventoryTransactionType } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustStockDto, CreateInventoryItemDto } from "./dto/inventory.dto";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.inventoryItem.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!item) throw new NotFoundException("Inventory item not found");
    return item;
  }

  create(tenantId: string, dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({ data: { tenantId, ...dto } });
  }

  async adjustStock(tenantId: string, id: string, dto: AdjustStockDto, performedById?: string) {
    const item = await this.findOne(tenantId, id);
    const delta = dto.type === "CONSUMPTION" || dto.type === "WASTE" ? -Math.abs(dto.quantity) : dto.quantity;
    const newQuantity = Math.max(0, item.quantity + delta);

    await this.prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: dto.type as InventoryTransactionType,
        quantity: dto.quantity,
        reason: dto.reason,
        performedById,
      },
    });

    return this.prisma.inventoryItem.update({ where: { id }, data: { quantity: newQuantity } });
  }

  async lowStock(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({ where: { tenantId } });
    return items.filter((i) => i.quantity <= i.reorderLevel);
  }
}
