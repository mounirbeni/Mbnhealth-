import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AiBotService } from "./ai-bot.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AiBotService", () => {
  let service: AiBotService;
  let prisma: { tenant: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { tenant: { findUnique: jest.fn() } };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiBotService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: () => "" } },
      ],
    }).compile();

    service = moduleRef.get(AiBotService);
  });

  it("degrades gracefully to a human-handoff message when no API key is configured", async () => {
    const result = await service.reply({ tenantId: "tenant-1", patientId: null, userMessage: "Hi" });

    expect(result.usedAi).toBe(false);
    expect(result.text).toContain("staff");
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });
});
