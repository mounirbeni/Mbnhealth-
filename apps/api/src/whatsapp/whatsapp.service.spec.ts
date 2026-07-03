import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { WhatsAppService } from "./whatsapp.service";
import { PrismaService } from "../prisma/prisma.service";

describe("WhatsAppService", () => {
  let service: WhatsAppService;
  let prisma: {
    whatsAppConfig: { findUnique: jest.Mock; findFirst: jest.Mock; upsert: jest.Mock };
    communicationLog: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      whatsAppConfig: { findUnique: jest.fn(), findFirst: jest.fn(), upsert: jest.fn() },
      communicationLog: { create: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: () => "v21.0" } },
      ],
    }).compile();

    service = moduleRef.get(WhatsAppService);
  });

  describe("sendText", () => {
    it("returns SIMULATED and never calls the Graph API when no config exists", async () => {
      prisma.whatsAppConfig.findUnique.mockResolvedValue(null);
      const fetchSpy = jest.spyOn(global, "fetch");

      const result = await service.sendText("tenant-1", "+212600000000", "hello");

      expect(result.status).toBe("SIMULATED");
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it("returns SIMULATED when the tenant's config is inactive", async () => {
      prisma.whatsAppConfig.findUnique.mockResolvedValue({
        phoneNumberId: "123",
        accessToken: "token",
        isActive: false,
      });
      const fetchSpy = jest.spyOn(global, "fetch");

      const result = await service.sendText("tenant-1", "+212600000000", "hello");

      expect(result.status).toBe("SIMULATED");
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it("calls the Graph API and returns SENT when the config is active", async () => {
      prisma.whatsAppConfig.findUnique.mockResolvedValue({
        phoneNumberId: "123",
        accessToken: "token",
        isActive: true,
      });
      const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [{ id: "wamid.abc" }] }),
      } as Response);

      const result = await service.sendText("tenant-1", "+212600000000", "hello");

      expect(result).toEqual({ status: "SENT", externalMessageId: "wamid.abc" });
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("123/messages"),
        expect.objectContaining({ method: "POST" }),
      );
      fetchSpy.mockRestore();
    });
  });

  describe("getConfigForDisplay", () => {
    it("never leaks the raw access token", async () => {
      prisma.whatsAppConfig.findUnique.mockResolvedValue({
        tenantId: "tenant-1",
        phoneNumberId: "123",
        accessToken: "super-secret-token-value",
        isActive: true,
      });

      const result = await service.getConfigForDisplay("tenant-1");

      expect(result).not.toHaveProperty("accessToken");
      expect(result?.accessTokenPreview).toBe("••••alue");
    });
  });
});
