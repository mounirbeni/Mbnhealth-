import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { DirectoryAdminService } from "./directory-admin.service";
import { UpdateInquiryStatusDto } from "./dto/update-inquiry-status.dto";
import { UpdateListingStatusDto } from "./dto/update-listing-status.dto";

// Platform-admin moderation for the public clinic directory. Not
// tenant-scoped — ClinicListing rows aren't owned by any tenant, so this is
// gated on DIRECTORY_MANAGE (platform Super Admin only), never on a
// per-tenant CLINIC_OWNER permission set.
@Controller("admin/directory")
@RequirePermissions(Permission.DIRECTORY_MANAGE)
export class DirectoryAdminController {
  constructor(private readonly admin: DirectoryAdminService) {}

  @Get("listings")
  listListings(@Query("status") status?: string) {
    return this.admin.listListings(status);
  }

  @Patch("listings/:id/status")
  updateListingStatus(@Param("id") id: string, @Body() dto: UpdateListingStatusDto) {
    return this.admin.updateListingStatus(id, dto);
  }

  @Get("inquiries")
  listInquiries(@Query("status") status?: string) {
    return this.admin.listInquiries(status);
  }

  @Patch("inquiries/:id/status")
  updateInquiryStatus(@Param("id") id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.admin.updateInquiryStatus(id, dto);
  }
}
