import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: { search?: string; roleId?: string }) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        roleId: params.roleId,
        ...(params.search
          ? {
              OR: [
                { firstName: { contains: params.search, mode: "insensitive" } },
                { lastName: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId }, include: { role: true } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException("A user with this email already exists");

    const passwordHash = await argon2.hash(dto.password);
    const { password, ...rest } = dto;
    return this.prisma.user.create({
      data: { ...rest, email: dto.email.toLowerCase(), tenantId, passwordHash },
      include: { role: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }

  async listRoles(tenantId: string) {
    return this.prisma.role.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }
}
