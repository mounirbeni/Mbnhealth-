import { Module } from "@nestjs/common";
import { DirectoryAdminController } from "./directory-admin.controller";
import { DirectoryAdminService } from "./directory-admin.service";

@Module({
  controllers: [DirectoryAdminController],
  providers: [DirectoryAdminService],
})
export class DirectoryAdminModule {}
