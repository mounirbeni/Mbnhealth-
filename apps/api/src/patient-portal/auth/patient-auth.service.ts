import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterPatientDto, LoginPatientDto } from "./dto/patient-auth.dto";
import { AuthenticatedPatient, PatientJwtPayload } from "./types/authenticated-patient.interface";

@Injectable()
export class PatientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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
}
