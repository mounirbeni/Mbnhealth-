import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedPatient } from "../types/authenticated-patient.interface";

export const CurrentPatient = createParamDecorator(
  (data: keyof AuthenticatedPatient | undefined, ctx: ExecutionContext): AuthenticatedPatient | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const patient: AuthenticatedPatient = request.patient;
    return data ? patient?.[data] : patient;
  },
);
