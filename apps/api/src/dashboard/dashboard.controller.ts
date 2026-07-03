import { Controller, Get, Query } from "@nestjs/common";
import { Permission } from "@mbn/database";
import { DashboardService } from "./dashboard.service";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

@Controller("dashboard")
@RequirePermissions(Permission.DASHBOARD_VIEW)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("overview")
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.overview(user.tenantId!);
  }

  @Get("revenue-trend")
  revenueTrend(@CurrentUser() user: AuthenticatedUser, @Query("months") months = "6") {
    return this.dashboardService.revenueTrend(user.tenantId!, +months);
  }

  @Get("appointments-trend")
  appointmentsTrend(@CurrentUser() user: AuthenticatedUser, @Query("days") days = "14") {
    return this.dashboardService.appointmentsTrend(user.tenantId!, +days);
  }

  @Get("upcoming-appointments")
  upcomingAppointments(@CurrentUser() user: AuthenticatedUser, @Query("limit") limit = "10") {
    return this.dashboardService.upcomingAppointments(user.tenantId!, +limit);
  }

  @Get("doctor-performance")
  doctorPerformance(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.doctorPerformance(user.tenantId!);
  }
}
