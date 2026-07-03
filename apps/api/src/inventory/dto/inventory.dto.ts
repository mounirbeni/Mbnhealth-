import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateInventoryItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  unitCost?: number;

  @IsOptional()
  @IsString()
  supplier?: string;
}

export class AdjustStockDto {
  @IsInt()
  quantity!: number;

  @IsString()
  type!: "RESTOCK" | "CONSUMPTION" | "ADJUSTMENT" | "WASTE";

  @IsOptional()
  @IsString()
  reason?: string;
}
