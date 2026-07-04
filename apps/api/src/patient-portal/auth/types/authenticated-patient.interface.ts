export interface AuthenticatedPatient {
  patientAccountId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PatientJwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  type: "patient_access";
}
