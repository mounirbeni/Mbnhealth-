import { Controller, Get, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { Permission } from "@mbn/database";
import { ReportsService } from "./reports.service";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.interface";

function parseRange(from?: string, to?: string) {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from ? new Date(from) : new Date(new Date().setMonth(toDate.getMonth() - 1));
  return { fromDate, toDate };
}

@Controller("reports")
@RequirePermissions(Permission.REPORTS_VIEW)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("revenue")
  revenue(@CurrentUser() user: AuthenticatedUser, @Query("from") from?: string, @Query("to") to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.revenueReport(user.tenantId!, fromDate, toDate);
  }

  @Get("appointments")
  appointments(@CurrentUser() user: AuthenticatedUser, @Query("from") from?: string, @Query("to") to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.appointmentsReport(user.tenantId!, fromDate, toDate);
  }

  @Get("patients")
  patients(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.patientsReport(user.tenantId!);
  }

  @Get("doctors")
  doctors(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.doctorsReport(user.tenantId!);
  }

  @Get("financial")
  financial(@CurrentUser() user: AuthenticatedUser, @Query("from") from?: string, @Query("to") to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.financialSummary(user.tenantId!, fromDate, toDate);
  }

  @Get("inventory")
  inventory(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.inventoryReport(user.tenantId!);
  }

  @Get("export.csv")
  async exportCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
    @Query("report") report: "revenue" | "appointments" | "patients" = "revenue",
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const { fromDate, toDate } = parseRange(from, to);
    const csv = await this.reportsService.exportCsv(user.tenantId!, report, fromDate, toDate);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${report}-report.csv"`);
    res.send(csv);
  }
}
