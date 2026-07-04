import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PatientAuthService } from "./patient-auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { MailerService } from "../../common/mailer/mailer.service";

describe("PatientAuthService password reset", () => {
  let service: PatientAuthService;
  let prisma: {
    patientAccount: { findUnique: jest.Mock; update: jest.Mock };
    patientPasswordResetToken: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };
  let mailer: { send: jest.Mock };

  beforeEach(async () => {
    prisma = {
      patientAccount: { findUnique: jest.fn(), update: jest.fn() },
      patientPasswordResetToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };
    mailer = { send: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PatientAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => "http://care.localhost:3000" } },
        { provide: MailerService, useValue: mailer },
      ],
    }).compile();

    service = moduleRef.get(PatientAuthService);
  });

  describe("forgotPassword", () => {
    it("sends a reset email and returns success when the account exists", async () => {
      prisma.patientAccount.findUnique.mockResolvedValue({ id: "acct-1", email: "patient@example.com" });
      prisma.patientPasswordResetToken.create.mockResolvedValue({});

      const result = await service.forgotPassword("patient@example.com");

      expect(result).toEqual({ success: true });
      expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: "patient@example.com" }));
    });

    it("returns the same generic response when no account matches, without sending an email", async () => {
      prisma.patientAccount.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword("nobody@example.com");

      expect(result).toEqual({ success: true });
      expect(mailer.send).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("rejects an unknown or expired token", async () => {
      prisma.patientPasswordResetToken.findUnique.mockResolvedValue(null);
      await expect(service.resetPassword("bad-token", "NewPassw0rd!")).rejects.toBeInstanceOf(BadRequestException);

      prisma.patientPasswordResetToken.findUnique.mockResolvedValue({
        id: "reset-1",
        patientAccountId: "acct-1",
        usedAt: null,
        expiresAt: new Date(Date.now() - 60_000),
      });
      await expect(service.resetPassword("expired-token", "NewPassw0rd!")).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it("updates the password and marks the token used for a valid token", async () => {
      prisma.patientPasswordResetToken.findUnique.mockResolvedValue({
        id: "reset-1",
        patientAccountId: "acct-1",
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      prisma.patientAccount.update.mockResolvedValue({});
      prisma.patientPasswordResetToken.update.mockResolvedValue({});

      const result = await service.resetPassword("good-token", "NewPassw0rd!");

      expect(result).toEqual({ success: true });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
