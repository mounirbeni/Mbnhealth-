import { IsIn } from "class-validator";

export class CreateCheckoutSessionDto {
  @IsIn(["STARTER", "PROFESSIONAL", "ENTERPRISE"])
  plan!: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
}
