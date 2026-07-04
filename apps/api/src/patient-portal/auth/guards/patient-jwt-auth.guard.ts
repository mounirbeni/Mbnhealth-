import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Guards patient-portal-only routes (booking, my-appointments). Never
 * accepts a staff access token — see PatientJwtStrategy for why the two
 * token types use entirely separate secrets. */
@Injectable()
export class PatientJwtAuthGuard extends AuthGuard("patient-jwt") {}
