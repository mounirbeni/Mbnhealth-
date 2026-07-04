import { Controller, Get, Param, Query } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { ClinicDirectoryService } from "./clinic-directory.service";
import { AvailabilityQueryDto, SearchClinicsDto } from "./dto/search-clinics.dto";

@Public()
@Controller("public/clinics")
export class ClinicDirectoryController {
  constructor(private readonly directory: ClinicDirectoryService) {}

  @Get()
  search(@Query() query: SearchClinicsDto) {
    return this.directory.search(query);
  }

  @Get(":slug")
  getProfile(@Param("slug") slug: string) {
    return this.directory.getProfile(slug);
  }

  @Get(":slug/doctors/:doctorId/availability")
  getAvailability(
    @Param("slug") slug: string,
    @Param("doctorId") doctorId: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.directory.getAvailability(slug, doctorId, query.date);
  }
}
