import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { MailerService } from "../../common/mailer/mailer.service";
import { RegisterPatientDto, LoginPatientDto } from "./dto/patient-auth.dto";
import { AuthenticatedPatient, PatientJwtPayload } from "./types/authenticated-patient.interface";

@Injectable()
export class PatientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  private toAuthenticated(account: { id: string; email: string; firstName: string; lastName: string }): AuthenticatedPatient {
    return {
      patientAccountId: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
    };
  }

  private issueToken(patient: AuthenticatedPatient) {
    const payload: PatientJwtPayload = {
      sub: patient.patientAccountId,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
      type: "patient_access",
    };
    return this.jwt.sign(payload);
  }

  async register(dto: RegisterPatientDto) {
    const existing = await this.prisma.patientAccount.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException("An account with this email already exists");

    const passwordHash = await argon2.hash(dto.password);
    const account = await this.prisma.patientAccount.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    const patient = this.toAuthenticated(account);
    return { accessToken: this.issueToken(patient), patient };
  }

  async login(dto: LoginPatientDto) {
    const account = await this.prisma.patientAccount.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!account) throw new UnauthorizedException("Invalid credentials");

    const valid = await argon2.verify(account.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const patient = this.toAuthenticated(account);
    return { accessToken: this.issueToken(patient), patient };
  }

  async me(patientAccountId: string) {
    const account = await this.prisma.patientAccount.findUniqueOrThrow({ where: { id: patientAccountId } });
    const { passwordHash, ...safe } = account;
    return safe;
  }

  // Always returns the same generic response whether or not the account
  // exists, so this endpoint can't be used to enumerate registered emails.
  async forgotPassword(email: string) {
    const account = await this.prisma.patientAccount.findUnique({ where: { email: email.toLowerCase() } });

    if (account) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      await this.prisma.patientPasswordResetToken.create({
        data: { patientAccountId: account.id, tokenHash, expiresAt: new Date(Date.now() + 1000 * 60 * 60) },
      });

      const portalUrl = this.config.get<string>("appUrls.patientPortal");
      const resetUrl = `${portalUrl}/patient/reset-password?token=${rawToken}`;
      await this.mailer.send({
        to: account.email,
        subject: "Reset your MBN Health password",
        text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
        html: `<p>Someone requested a password reset for your MBN Health patient account.</p><p><a href="${resetUrl}">Reset your password</a> — this link expires in 1 hour.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    }

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await this.prisma.patientPasswordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("This reset link is invalid or has expired");
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.patientAccount.update({ where: { id: record.patientAccountId }, data: { passwordHash } }),
      this.prisma.patientPasswordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    return { success: true };
  }
}
