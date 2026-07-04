export interface AuthenticatedPatient {
  patientId: string;
  tenantId: string;
  email: string | null;
  firstName: string;
  lastName: string;
}

export interface PatientAccessPayload {
  sub: string;
  tenantId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  type: "patient_access";
}
