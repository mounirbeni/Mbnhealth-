import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { InvoiceStatus, Permission } from "@mbn/database";
import { BillingService } from "./billing.service";
import { CreateInsuranceClaimDto, CreateInvoiceDto, RecordPaymentDto } from "./dto/billing.dto";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { AuditLog } from "../common/decorators/audit-log.decorator";

@Controller("billing")
@RequirePermissions(Permission.BILLING_READ)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("invoices")
  findAllInvoices(
    @CurrentUser() user: AuthenticatedUser,
    @Query("patientId") patientId?: string,
    @Query("status") status?: InvoiceStatus,
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "25",
  ) {
    return this.billingService.findAllInvoices(user.tenantId!, {
      patientId,
      status,
      page: +page,
      pageSize: +pageSize,
    });
  }

  @Get("invoices/outstanding")
  outstanding(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.outstandingBalance(user.tenantId!);
  }

  @Get("invoices/:id")
  findOneInvoice(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.billingService.findOneInvoice(user.tenantId!, id);
  }

  @Post("invoices")
  @RequirePermissions(Permission.BILLING_WRITE)
  @AuditLog("Invoice")
  createInvoice(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(user.tenantId!, dto);
  }

  @Patch("invoices/:id/void")
  @RequirePermissions(Permission.BILLING_WRITE)
  @AuditLog("Invoice")
  voidInvoice(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.billingService.voidInvoice(user.tenantId!, id);
  }

  @Post("invoices/:id/payments")
  @RequirePermissions(Permission.BILLING_WRITE)
  @AuditLog("Payment")
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.billingService.recordPayment(user.tenantId!, id, dto);
  }

  @Patch("payments/:id/refund")
  @RequirePermissions(Permission.BILLING_WRITE)
  @AuditLog("Payment")
  refundPayment(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.billingService.refundPayment(user.tenantId!, id);
  }

  @Get("insurance-claims")
  @RequirePermissions(Permission.INSURANCE_MANAGE)
  findAllClaims(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.findAllClaims(user.tenantId!);
  }

  @Post("insurance-claims")
  @RequirePermissions(Permission.INSURANCE_MANAGE)
  @AuditLog("InsuranceClaim")
  createClaim(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateInsuranceClaimDto) {
    return this.billingService.createClaim(user.tenantId!, dto);
  }

  @Patch("insurance-claims/:id/status")
  @RequirePermissions(Permission.INSURANCE_MANAGE)
  @AuditLog("InsuranceClaim")
  updateClaimStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body("status") status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED" | "PAID",
    @Body("approvedAmount") approvedAmount?: number,
  ) {
    return this.billingService.updateClaimStatus(user.tenantId!, id, status, approvedAmount);
  }
}
