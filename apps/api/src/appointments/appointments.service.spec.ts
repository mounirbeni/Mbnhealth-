import { Test } from "@nestjs/testing";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { AppointmentStatus } from "@mbn/database";
import { AppointmentsService } from "./appointments.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AppointmentsService", () => {
  let service: AppointmentsService;
  let prisma: {
    appointment: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [AppointmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(AppointmentsService);
  });

  describe("create", () => {
    it("rejects an appointment whose end time is before its start time", async () => {
      await expect(
        service.create(
          "tenant-1",
          {
            patientId: "p1",
            doctorId: "d1",
            startTime: "2026-01-01T10:00:00.000Z",
            endTime: "2026-01-01T09:00:00.000Z",
          },
          "user-1",
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejects a double-booked doctor slot", async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: "existing" });

      await expect(
        service.create(
          "tenant-1",
          {
            patientId: "p1",
            doctorId: "d1",
            startTime: "2026-01-01T10:00:00.000Z",
            endTime: "2026-01-01T10:30:00.000Z",
          },
          "user-1",
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it("creates the appointment when the slot is free", async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue({ id: "new-appt" });

      const result = await service.create(
        "tenant-1",
        {
          patientId: "p1",
          doctorId: "d1",
          startTime: "2026-01-01T10:00:00.000Z",
          endTime: "2026-01-01T10:30:00.000Z",
        },
        "user-1",
      );

      expect(result).toEqual({ id: "new-appt" });
      expect(prisma.appointment.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateStatus", () => {
    it("allows a valid transition from CONFIRMED to CHECKED_IN", async () => {
      prisma.appointment.findFirst.mockResolvedValue({
        id: "a1",
        status: AppointmentStatus.CONFIRMED,
      });
      prisma.appointment.update.mockResolvedValue({ id: "a1", status: AppointmentStatus.CHECKED_IN });

      const result = await service.updateStatus("tenant-1", "a1", {
        status: AppointmentStatus.CHECKED_IN,
      });

      expect(result.status).toBe(AppointmentStatus.CHECKED_IN);
    });

    it("rejects an invalid transition from COMPLETED to CHECKED_IN", async () => {
      prisma.appointment.findFirst.mockResolvedValue({
        id: "a1",
        status: AppointmentStatus.COMPLETED,
      });

      await expect(
        service.updateStatus("tenant-1", "a1", { status: AppointmentStatus.CHECKED_IN }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
