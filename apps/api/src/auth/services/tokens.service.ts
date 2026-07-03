import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser, JwtAccessPayload } from "../types/authenticated-user.interface";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  signAccessToken(user: AuthenticatedUser): { token: string; expiresIn: number } {
    const payload: JwtAccessPayload = {
      sub: user.userId,
      tenantId: user.tenantId,
      roleId: user.roleId,
      roleName: user.roleName,
      systemRole: user.systemRole,
      permissions: user.permissions,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: "access",
    };
    const ttl = this.config.get<string>("jwt.accessTtl")!;
    const token = this.jwt.sign(payload, {
      secret: this.config.get<string>("jwt.accessSecret"),
      expiresIn: ttl,
    });
    return { token, expiresIn: this.ttlToSeconds(ttl) };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private ttlToSeconds(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
    return value * multiplier;
  }

  async issueRefreshToken(params: {
    userId: string;
    tenantId: string | null;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const rawToken = randomBytes(48).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const ttlSeconds = this.ttlToSeconds(this.config.get<string>("jwt.refreshTtl")!);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tenantId: params.tenantId,
        tokenHash,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        expiresAt,
      },
    });

    return rawToken;
  }

  async findValidRefreshToken(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { role: true } } },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      return null;
    }
    return record;
  }

  async revokeRefreshToken(rawToken: string, replacedBy?: string) {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date(), replacedBy },
    });
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
