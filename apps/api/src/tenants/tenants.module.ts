import { Module } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { TenantsController } from "./tenants.controller";
import { TenantProvisioningService } from "./tenant-provisioning.service";
import { AuditLogModule } from "../audit-log/audit-log.module";

@Module({
  imports: [AuditLogModule],
  providers: [TenantsService, TenantProvisioningService],
  controllers: [TenantsController],
  exports: [TenantsService, TenantProvisioningService],
})
export class TenantsModule {}
