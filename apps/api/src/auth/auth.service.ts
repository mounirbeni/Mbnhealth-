import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuditAction, SubscriptionPlan, SubscriptionStatus, User, Role } from "@mbn/database";
import { PrismaService } from "../prisma/prisma.service";
import { AuditLogService } from "../audit-log/audit-log.service";
import { TenantProvisioningService } from "../tenants/tenant-provisioning.service";
import { TokensService } from "./services/tokens.service";
import { MfaService } from "./services/mfa.service";
import { RegisterTenantDto } from "./dto/register-tenant.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthenticatedUser } from "./types/authenticated-user.interface";

type UserWithRole = User & { role: Role };

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tokens: TokensService,
    private readonly mfa: MfaService,
    private readonly auditLog: AuditLogService,
    private readonly provisioning: TenantProvisioningService,
  ) {}

  private toAuthenticatedUser(user: UserWithRole): AuthenticatedUser {
    return {
      userId: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
      roleName: user.role.name,
      systemRole: user.role.systemRole,
      permissions: user.role.permissions,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async registerTenant(dto: RegisterTenantDto, meta: RequestMeta) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.ownerEmail.toLowerCase() } });
    if (existingEmail) throw new ConflictException("An account with this email already exists");

    const passwordHash = await argon2.hash(dto.password);

    const result = await this.provisioning.provision({
      clinicName: dto.clinicName,
      city: dto.city,
      address: dto.address,
      phone: dto.phone,
      website: dto.website,
      plan: SubscriptionPlan.TRIAL,
      subscriptionStatus: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      ownerEmail: dto.ownerEmail,
      ownerFirstName: dto.ownerFirstName,
      ownerLastName: dto.ownerLastName,
      passwordHash,
      ownerRole: dto.ownerRole,
    });

    await this.auditLog.record({
      tenantId: result.tenant.id,
      userId: result.owner.id,
      action: AuditAction.CREATE,
      entityType: "Tenant",
      entityId: result.tenant.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.issueSession(result.owner, meta);
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      await this.auditLog.record({
        tenantId: null,
        action: AuditAction.LOGIN_FAILED,
        entityType: "User",
        metadata: { email: dto.email },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.auditLog.record({
        tenantId: user.tenantId,
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        entityType: "User",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.mfaEnabled) {
      const challengeToken = this.jwt.sign(
        { sub: user.id, type: "mfa_challenge" },
        { secret: this.config.get<string>("jwt.accessSecret"), expiresIn: "5m" },
      );
      return { mfaRequired: true, challengeToken };
    }

    return this.issueSession(user, meta);
  }

  async verifyMfaAndLogin(challengeToken: string, code: string, meta: RequestMeta) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwt.verify(challengeToken, {
        secret: this.config.get<string>("jwt.accessSecret"),
      });
    } catch {
      throw new UnauthorizedException("MFA challenge expired, please log in again");
    }
    if (payload.type !== "mfa_challenge") throw new UnauthorizedException("Invalid challenge token");

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user || !user.mfaSecret) throw new UnauthorizedException("Invalid session");

    const valid =
      this.mfa.verifyToken(code, user.mfaSecret) || user.mfaRecoveryCodes.includes(code);
    if (!valid) throw new UnauthorizedException("Invalid MFA code");

    if (user.mfaRecoveryCodes.includes(code)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { mfaRecoveryCodes: user.mfaRecoveryCodes.filter((c) => c !== code) },
      });
    }

    return this.issueSession(user, meta);
  }

  private async issueSession(user: UserWithRole, meta: RequestMeta) {
    const authUser = this.toAuthenticatedUser(user);
    const { token: accessToken, expiresIn } = this.tokens.signAccessToken(authUser);
    const refreshToken = await this.tokens.issueRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.auditLog.record({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: "User",
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: authUser,
    };
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta) {
    const record = await this.tokens.findValidRefreshToken(rawRefreshToken);
    if (!record) throw new UnauthorizedException("Invalid or expired refresh token");

    const user = record.user as UserWithRole;
    if (!user.isActive) throw new ForbiddenException("Account disabled");

    const authUser = this.toAuthenticatedUser(user);
    const { token: accessToken, expiresIn } = this.tokens.signAccessToken(authUser);
    const newRefreshToken = await this.tokens.issueRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    await this.tokens.revokeRefreshToken(rawRefreshToken, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken, expiresIn, user: authUser };
  }

  async logout(rawRefreshToken: string) {
    await this.tokens.revokeRefreshToken(rawRefreshToken);
    return { success: true };
  }

  async startMfaSetup(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const { secret, otpauthUrl } = this.mfa.generateSecret(user.email);
    await this.prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });
    const qrCodeDataUrl = await this.mfa.generateQrCodeDataUrl(otpauthUrl);
    return { secret, otpauthUrl, qrCodeDataUrl };
  }

  async confirmMfaSetup(userId: string, code: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.mfaSecret) throw new BadRequestException("MFA setup not started");
    const valid = this.mfa.verifyToken(code, user.mfaSecret);
    if (!valid) throw new BadRequestException("Invalid verification code");

    const recoveryCodes = this.mfa.generateRecoveryCodes();
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaRecoveryCodes: recoveryCodes },
    });
    return { recoveryCodes };
  }

  async disableMfa(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: [] },
    });
    return { success: true };
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "desc" },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.deleteMany({ where: { id: sessionId, userId } });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { role: true, doctorProfile: true, tenant: true },
    });
    const { passwordHash, mfaSecret, mfaRecoveryCodes, ...safe } = user;
    return safe;
  }
}
