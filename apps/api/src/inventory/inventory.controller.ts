import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { InventoryService } from "./inventory.service";
import { AdjustStockDto, CreateInventoryItemDto } from "./dto/inventory.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("inventory")
@RequirePermissions(Permission.INVENTORY_READ)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.findAll(user.tenantId!);
  }

  @Get("low-stock")
  lowStock(@CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.lowStock(user.tenantId!);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.inventoryService.findOne(user.tenantId!, id);
  }

  @Post()
  @RequirePermissions(Permission.INVENTORY_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(user.tenantId!, dto);
  }

  @Patch(":id/adjust")
  @RequirePermissions(Permission.INVENTORY_WRITE)
  adjustStock(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(user.tenantId!, id, dto, user.userId);
  }
}
