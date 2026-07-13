import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ValidationPipe } from "@nestjs/common";
import configuration from "./config/configuration";
import { PrismaModule } from "./prisma/prisma.module";
import { MailerModule } from "./common/mailer/mailer.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TenantsModule } from "./tenants/tenants.module";
import { AuditLogModule } from "./audit-log/audit-log.module";
import { DepartmentsModule } from "./departments/departments.module";
import { DoctorsModule } from "./doctors/doctors.module";
import { PatientsModule } from "./patients/patients.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { MedicalRecordsModule } from "./medical-records/medical-records.module";
import { PrescriptionsModule } from "./prescriptions/prescriptions.module";
import { BillingModule } from "./billing/billing.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { LabModule } from "./lab/lab.module";
import { RadiologyModule } from "./radiology/radiology.module";
import { InventoryModule } from "./inventory/inventory.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { MessagesModule } from "./messages/messages.module";
import { ReportsModule } from "./reports/reports.module";
import { UploadsModule } from "./uploads/uploads.module";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";
import { AiBotModule } from "./ai-bot/ai-bot.module";
import { RemindersModule } from "./reminders/reminders.module";
import { BillingSubscriptionModule } from "./billing-subscription/billing-subscription.module";
import { PatientPortalModule } from "./patient-portal/patient-portal.module";
import { DirectoryAdminModule } from "./directory-admin/directory-admin.module";
import { HealthController } from "./health/health.controller";
import { RootController } from "./health/root.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>("rateLimit.ttl")! * 1000,
            limit: config.get<number>("rateLimit.max")!,
          },
        ],
      }),
    }),
    PrismaModule,
    MailerModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    AuditLogModule,
    DepartmentsModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    BillingModule,
    DashboardModule,
    LabModule,
    RadiologyModule,
    InventoryModule,
    NotificationsModule,
    MessagesModule,
    ReportsModule,
    UploadsModule,
    WhatsAppModule,
    AiBotModule,
    RemindersModule,
    BillingSubscriptionModule,
    PatientPortalModule,
    DirectoryAdminModule,
  ],
  controllers: [HealthController, RootController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      