import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { PaymentMethod } from "@mbn/database";

export class InvoiceItemInputDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsString()
  patientId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInputDto)
  items!: InvoiceItemInputDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class CreateInsuranceClaimDto {
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsString()
  provider!: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsNumber()
  @Min(0)
  claimAmount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
