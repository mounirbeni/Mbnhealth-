import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InvoiceStatus, PaymentStatus } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInsuranceClaimDto, CreateInvoiceDto, RecordPaymentDto } from "./dto/billing.dto";

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllInvoices(
    tenantId: string,
    params: { patientId?: string; status?: InvoiceStatus; page: number; pageSize: number },
  ) {
    const where = { tenantId, patientId: params.patientId, status: params.status };
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { patient: true, payments: true, items: true },
        orderBy: { issueDate: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async findOneInvoice(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { patient: true, payments: true, items: true, insuranceClaims: true },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  private async nextInvoiceNumber(tenantId: string) {
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    return `INV-${String(count + 1).padStart(6, "0")}`;
  }

  async createInvoice(tenantId: string, dto: CreateInvoiceDto) {
    const subtotal = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const taxAmount = dto.taxAmount ?? 0;
    const discountAmount = dto.discountAmount ?? 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    const invoiceNumber = await this.nextInvoiceNumber(tenantId);

    return this.prisma.invoice.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        invoiceNumber,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        status: InvoiceStatus.SENT,
        items: {
          create: dto.items.map((i) => ({
            description: i.description,
            serviceType: i.serviceType,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  }

  async voidInvoice(tenantId: string, id: string) {
    await this.findOneInvoice(tenantId, id);
    return this.prisma.invoice.update({ where: { id }, data: { status: InvoiceStatus.VOID } });
  }

  async recordPayment(tenantId: string, invoiceId: string, dto: RecordPaymentDto) {
    const invoice = await this.findOneInvoice(tenantId, invoiceId);
    if (invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException("Cannot record a payment on a void invoice");
    }

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        invoiceId,
        amount: dto.amount,
        method: dto.method,
        transactionRef: dto.transactionRef,
        status: PaymentStatus.COMPLETED,
      },
    });

    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    const newStatus =
      newPaidAmount >= Number(invoice.totalAmount) ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });

    return payment;
  }

  async refundPayment(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException("Payment not found");

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED, refundedAt: new Date() },
    });

    const newPaidAmount = Math.max(0, Number(payment.invoice.paidAmount) - Number(payment.amount));
    const newStatus =
      newPaidAmount <= 0
        ? InvoiceStatus.SENT
        : newPaidAmount >= Number(payment.invoice.totalAmount)
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIALLY_PAID;

    await this.prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });

    return { success: true };
  }

  async outstandingBalance(tenantId: string) {
    const result = await this.prisma.invoice.aggregate({
      where: { tenantId, status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] } },
      _sum: { totalAmount: true, paidAmount: true },
    });
    const total = Number(result._sum.totalAmount ?? 0);
    const paid = Number(result._sum.paidAmount ?? 0);
    return { outstanding: total - paid };
  }

  // ── Insurance claims ──────────────────────────────────────────────────────
  async findAllClaims(tenantId: string) {
    return this.prisma.insuranceClaim.findMany({
      where: { tenantId },
      include: { patient: true, invoice: true },
      orderBy: { submittedAt: "desc" },
    });
  }

  createClaim(tenantId: string, dto: CreateInsuranceClaimDto) {
    return this.prisma.insuranceClaim.create({ data: { tenantId, ...dto } });
  }

  async updateClaimStatus(
    tenantId: string,
    id: string,
    status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED" | "PAID",
    approvedAmount?: number,
  ) {
    const claim = await this.prisma.insuranceClaim.findFirst({ where: { id, tenantId } });
    if (!claim) throw new NotFoundException("Insurance claim not found");
    return this.prisma.insuranceClaim.update({
      where: { id },
      data: {
        status,
        approvedAmount,
        resolvedAt: ["APPROVED", "PARTIALLY_APPROVED", "REJECTED", "PAID"].includes(status)
          ? new Date()
          : undefined,
      },
    });
  }
}
