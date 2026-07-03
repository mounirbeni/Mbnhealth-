import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { ConfirmUploadDto, RequestUploadUrlDto } from "./dto/uploads.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("request-url")
  requestUploadUrl(@CurrentUser() user: AuthenticatedUser, @Body() dto: RequestUploadUrlDto) {
    return this.uploadsService.requestUploadUrl(user.tenantId!, dto);
  }

  @Post("confirm")
  confirmUpload(@CurrentUser() user: AuthenticatedUser, @Body() dto: ConfirmUploadDto) {
    return this.uploadsService.confirmUpload(user.tenantId!, dto, user.userId);
  }

  @Get("download-url")
  getDownloadUrl(@Query("key") key: string) {
    return this.uploadsService.getDownloadUrl(key);
  }
}
