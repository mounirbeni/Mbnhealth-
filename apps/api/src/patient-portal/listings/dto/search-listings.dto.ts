import { IsBooleanString, IsIn, IsOptional, IsString } from "class-validator";

export class SearchListingsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBooleanString()
  wheelchairAccessible?: string;

  @IsOptional()
  @IsBooleanString()
  acceptsInsurance?: string;

  @IsOptional()
  @IsBooleanString()
  openNow?: string;

  @IsOptional()
  @IsIn(["rating", "reviews", "name"])
  sort?: "rating" | "reviews" | "name";
}
