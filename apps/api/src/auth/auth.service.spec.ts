import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditLogService } from "../audit-log/audit-log.service";
import { TokensService } from "./services/tokens.service";
import { MfaService } from "./services/mfa.service";
import { MailerService } from "../common/mailer/mailer.service";

describe("AuthService password reset", () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock; update: jest.Mock };
    passwordResetToken: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };
  let mailer: { send: jest.Mock };
  let tokens: { revokeAllUserTokens: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), update: jest.fn() },
      passwordResetToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };
    mailer = { send: jest.fn() };
    tokens = { revokeAllUserTokens: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => "http://localhost:3000" } },
        { provide: TokensService, useValue: tokens },
        { provide: MfaService, useValue: {} },
        { provide: AuditLogService, useValue: { record: jest.fn() } },
        { provide: MailerService, useValue: mailer },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe("forgotPassword", () => {
    it("sends a reset email and returns success when the account exists", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "user-1", email: "owner@demo.com", isActive: true });
      prisma.passwordResetToken.create.mockResolvedValue({});

      const result = await service.forgotPassword({ email: "owner@demo.com" });

      expect(result).toEqual({ success: true });
      expect(prisma.passwordResetToken.create).toHaveBeenCalled();
      expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@demo.com" }));
    });

    it("returns the same generic response when no account matches, without sending an email", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: "nobody@demo.com" });

      expect(result).toEqual({ success: true });
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mailer.send).not.toHaveBeenCalled();
    });

    it("does not send a reset email for a deactivated account", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "user-1", email: "disabled@demo.com", isActive: false });

      await service.forgotPassword({ email: "disabled@demo.com" });

      expect(mailer.send).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("rejects an unknown token", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword("bad-token", "NewPassw0rd!")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejects an already-used token", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "reset-1",
        userId: "user-1",
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.resetPassword("used-token", "NewPassw0rd!")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejects an expired token", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "reset-1",
        userId: "user-1",
        usedAt: null,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(service.resetPassword("expired-token", "NewPassw0rd!")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("updates the password, marks the token used, and revokes existing sessions for a valid token", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "reset-1",
        userId: "user-1",
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      prisma.user.update.mockResolvedValue({});
      prisma.passwordResetToken.update.mockResolvedValue({});

      const result = await service.resetPassword("good-token", "NewPassw0rd!");

      expect(result).toEqual({ success: true });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(tokens.revokeAllUserTokens).toHaveBeenCalledWith("user-1");
    });
  });
});
