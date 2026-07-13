import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { ClinicListingsService } from "./clinic-listings.service";
import { SearchListingsDto } from "./dto/search-listings.dto";
import { CreateListingInquiryDto } from "./dto/create-listing-inquiry.dto";

// Public, Morocco-wide "Find a Clinic" directory of real, independently
// sourced private clinics — separate from `/public/clinics`, which only
// searches MBN Health tenant clinics. See ClinicListing in schema.prisma.
@Public()
@Controller("public/directory")
export class ClinicListingsController {
  constructor(private readonly listings: ClinicListingsService) {}

  @Get()
  search(@Query() query: SearchListingsDto) {
    return this.listings.search(query);
  }

  @Get("filters")
  getFilters() {
    return this.listings.getFilters();
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.listings.getBySlug(slug);
  }

  // No patient login required: these are lead-gen requests to real-world
  // clinics that mostly aren't MBN Health customers yet, so there's no
  // dashboard on the other end to gate access to — see ClinicListingInquiry.
  @Post(":slug/inquiries")
  createInquiry(@Param("slug") slug: string, @Body() dto: CreateListingInquiryDto) {
    return this.listings.createInquiry(slug, dto);
  }
}
