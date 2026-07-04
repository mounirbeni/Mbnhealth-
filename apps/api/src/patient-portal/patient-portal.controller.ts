import { Controller, Get, UseGuards } from "@nestjs/common";
import { PatientPortalService } from "./patient-portal.service";
import { Public } from "../common/decorators/public.decorator";
import { PatientAuthGuard } from "./guards/patient-auth.guard";
import { CurrentPatient } from "./decorators/current-patient.decorator";

@Controller("portal")
@Public()
@UseGuards(PatientAuthGuard)
export class PatientPortalController {
  constructor(private readonly patientPortalService: PatientPortalService) {}

  @Get("appointments")
  appointments(@CurrentPatient("patientId") patientId: string) {
    return this.patientPortalService.appointments(patientId);
  }

  @Get("medical-records")
  medicalRecords(@CurrentPatient("patientId") patientId: string) {
    return this.patientPortalService.medicalRecords(patientId);
  }

  @Get("prescriptions")
  prescriptions(@CurrentPatient("patientId") patientId: string) {
    return this.patientPortalService.prescriptions(patientId);
  }

  @Get("invoices")
  invoices(@CurrentPatient("patientId") patientId: string) {
    return this.patientPortalService.invoices(patientId);
  }

  @Get("lab-orders")
  labOrders(@CurrentPatient("patientId") patientId: string) {
    return this.patientPortalService.labOrders(patientId);
  }

  @Get("radiology-orders")
  radiologyOrders(@CurrentPatient("patientId") patientId: string) {
    return this.patientPortalService.radiologyOrders(patientId);
  }
}
