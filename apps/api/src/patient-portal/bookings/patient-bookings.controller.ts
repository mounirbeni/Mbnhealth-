import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { PatientJwtAuthGuard } from "../auth/guards/patient-jwt-auth.guard";
import { CurrentPatient } from "../auth/decorators/current-patient.decorator";
import { AuthenticatedPatient } from "../auth/types/authenticated-patient.interface";
import { PatientBookingsService } from "./patient-bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Public()
@UseGuards(PatientJwtAuthGuard)
@Controller("public/bookings")
export class PatientBookingsController {
  constructor(private readonly bookings: PatientBookingsService) {}

  @Post()
  create(@CurrentPatient() patient: AuthenticatedPatient, @Body() dto: CreateBookingDto) {
    return this.bookings.create(patient.patientAccountId, dto);
  }

  @Get("mine")
  mine(@CurrentPatient() patient: AuthenticatedPatient) {
    return this.bookings.myBookings(patient.patientAccountId);
  }
}
