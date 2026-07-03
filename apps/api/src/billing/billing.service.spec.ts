import { Test } from "@nestjs/testing";
import { InvoiceStatus } from "@mbn/database";
import { BillingService } from "./billing.service";
import { PrismaService } from "../prisma/prisma.service";

describe("BillingService", () => {
  let service: BillingService;
  let prisma: {
    invoice: { count: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    payment: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      invoice: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      payment: { create: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [BillingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(BillingService);
  });

  describe("createInvoice", () => {
    it("computes subtotal and total from line items", async () => {
      prisma.invoice.count.mockResolvedValue(0);
      prisma.invoice.create.mockImplementation(({ data }) => Promise.resolve(data));

      const invoice = await service.createInvoice("tenant-1", {
        patientId: "p1",
        items: [
          { description: "Consultation", quantity: 1, unitPrice: 350 },
          { description: "Bandage", quantity: 2, unitPrice: 10 },
        ],
      });

      expect(invoice.subtotal).toBe(370);
      expect(invoice.totalAmount).toBe(370);
      expect(invoice.invoiceNumber).toBe("INV-000001");
    });

    it("applies tax and discount to the total", async () => {
      prisma.invoice.count.mockResolvedValue(4);
      prisma.invoice.create.mockImplementation(({ data }) => Promise.resolve(data));

      const invoice = await service.createInvoice("tenant-1", {
        patientId: "p1",
        items: [{ description: "Consultation", quantity: 1, unitPrice: 100 }],
        taxAmount: 20,
        discountAmount: 10,
      });

      expect(invoice.totalAmount).toBe(110);
      expect(invoice.invoiceNumber).toBe("INV-000005");
    });
  });

  describe("recordPayment", () => {
    it("marks the invoice PAID once the paid amount reaches the total", async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: "inv-1",
        status: InvoiceStatus.SENT,
        totalAmount: 100,
        paidAmount: 0,
      });
      prisma.payment.create.mockResolvedValue({ id: "pay-1", amount: 100 });

      await service.recordPayment("tenant-1", "inv-1", { amount: 100, method: "CASH" });

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { paidAmount: 100, status: InvoiceStatus.PAID },
      });
    });

    it("marks the invoice PARTIALLY_PAID when the paid amount is under the total", async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: "inv-1",
        status: InvoiceStatus.SENT,
        totalAmount: 100,
        paidAmount: 0,
      });
      prisma.payment.create.mockResolvedValue({ id: "pay-1", amount: 40 });

      await service.recordPayment("tenant-1", "inv-1", { amount: 40, method: "CASH" });

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { paidAmount: 40, status: InvoiceStatus.PARTIALLY_PAID },
      });
    });
  });
});
