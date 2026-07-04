import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { PrismaService } from "../prisma/prisma.service";

describe("TenantsService", () => {
  let service: TenantsService;
  let prisma: {
    tenant: { findUnique: jest.Mock; findMany: jest.Mock; count: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      tenant: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [TenantsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(TenantsService);
  });

  describe("getOwn", () => {
    it("throws when the tenant doesn't exist", async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.getOwn("missing-tenant")).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("findAll (platform admin)", () => {
    it("paginates and filters by name search", async () => {
      prisma.tenant.findMany.mockResolvedValue([{ id: "t1", name: "Demo Clinic" }]);
      prisma.tenant.count.mockResolvedValue(1);

      const result = await service.findAll({ search: "Demo", page: 1, pageSize: 25 });

      expect(result).toEqual({ items: [{ id: "t1", name: "Demo Clinic" }], total: 1, page: 1, pageSize: 25 });
      expect(prisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: "Demo", mode: "insensitive" } },
          skip: 0,
          take: 25,
        }),
      );
    });

    it("computes skip from the requested page", async () => {
      prisma.tenant.findMany.mockResolvedValue([]);
      prisma.tenant.count.mockResolvedValue(0);

      await service.findAll({ page: 3, pageSize: 10 });

      expect(prisma.tenant.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
    });
  });

  describe("setStatus", () => {
    it("updates the tenant's status", async () => {
      prisma.tenant.update.mockResolvedValue({ id: "t1", status: "SUSPENDED" });

      const result = await service.setStatus("t1", "SUSPENDED");

      expect(result).toEqual({ id: "t1", status: "SUSPENDED" });
      expect(prisma.tenant.update).toHaveBeenCalledWith({ where: { id: "t1" }, data: { status: "SUSPENDED" } });
    });
  });
});
