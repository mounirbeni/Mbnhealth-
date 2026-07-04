import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Patient } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { RequestMeta } from "../common/decorators/request-meta.decorator";
import { ActivatePortalDto } from "./dto/activate-portal.dto";
import { AuthenticatedPatient, PatientAccessPayload } from "./types/authenticated-patient.interface";

@Injectable()
export class PatientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  private toAuthenticatedPatient(patient: Patient): AuthenticatedPatient {
    return {
      patientId: patient.id,
      tenantId: patient.tenantId,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
    };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async issueSession(patient: AuthenticatedPatient, meta: RequestMeta) {
    const payload: PatientAccessPayload = {
      sub: patient.patientId,
      tenantId: patient.tenantId,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
      type: "patient_access",
    };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>("jwt.accessSecret"),
      expiresIn: "15m",
    });

    const rawRefreshToken = randomBytes(48).toString("hex");
    await this.prisma.patientRefreshToken.create({
      data: {
        patientId: patient.patientId,
        tokenHash: this.hashToken(rawRefreshToken),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken, expiresIn: 900, patient };
  }

  async activate(dto: ActivatePortalDto, meta: RequestMeta) {
    const email = dto.email.toLowerCase();
    const candidates = await this.prisma.patient.findMany({
      where: { mrn: dto.mrn, email: { equals: email, mode: "insensitive" } },
    });
    if (candidates.length === 0) {
      throw new BadRequestException("No patient record matches that file number and email");
    }
    if (candidates.length > 1) {
      throw new ConflictException("Multiple records match — contact your clinic to activate your account");
    }
    const patient = candidates[0];
    if (patient.portalPasswordHash) {
      throw new ConflictException("This account is already activated — try signing in instead");
    }

    const portalPasswordHash = await argon2.hash(dto.password);
    const updated = await this.prisma.patient.update({
      where: { id: patient.id },
      data: { portalPasswordHash, portalActivatedAt: new Date() },
    });

    return this.issueSession(this.toAuthenticatedPatient(updated), meta);
  }

  async login(email: string, password: string, meta: RequestMeta) {
    const patients = await this.prisma.patient.findMany({
      where: { email: { equals: email.toLowerCase(), mode: "insensitive" }, portalPasswordHash: { not: null } },
    });
    if (patients.length !== 1) throw new UnauthorizedException("Invalid credentials");

    const patient = patients[0];
    const valid = await argon2.verify(patient.portalPasswordHash!, password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return this.issueSession(this.toAuthenticatedPatient(patient), meta);
  }

  async refresh(rawToken: string, meta: RequestMeta) {
    const record = await this.prisma.patientRefreshToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      include: { patient: true },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const session = await this.issueSession(this.toAuthenticatedPatient(record.patient), meta);
    await this.prisma.patientRefreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), replacedBy: session.refreshToken },
    });
    return session;
  }

  async logout(rawToken: string) {
    await this.prisma.patientRefreshToken.updateMany({
      where: { tokenHash: this.hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  // Always responds the same way regardless of whether the email matches an
  // activated account, so this endpoint can't be used to enumerate patients.
  async forgotPassword(email: string) {
    const patients = await this.prisma.patient.findMany({
      where: { email: { equals: email.toLowerCase(), mode: "insensitive" }, portalPasswordHash: { not: null } },
    });
    if (patients.length === 1) {
      const patient = patients[0];
      const rawToken = randomBytes(32).toString("hex");
      await this.prisma.patientPasswordResetToken.create({
        data: {
          patientId: patient.id,
          tokenHash: this.hashToken(rawToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      });

      const resetUrl = `${this.config.get<string>("webUrl")}/portal/reset-password?token=${rawToken}`;
      await this.email.send(
        patient.email!,
        "Reset your patient portal password",
        `We received a request to reset your password. This link expires in 30 minutes:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
      );
    }
    return { success: true };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const record = await this.prisma.patientPasswordResetToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("This reset link is invalid or has expired");
    }

    const portalPasswordHash = await argon2.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.patient.update({ where: { id: record.patientId }, data: { portalPasswordHash } }),
      this.prisma.patientPasswordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.patientRefreshToken.updateMany({
        where: { patientId: record.patientId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { success: true };
  }

  async me(patientId: string) {
    const patient = await this.prisma.patient.findUniqueOrThrow({ where: { id: patientId } });
    const { portalPasswordHash, ...safe } = patient;
    return safe;
  }
}
