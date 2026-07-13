import argon2 from "argon2";
import {
  PrismaClient,
  SystemRoleName,
  Gender,
  AppointmentStatus,
  AppointmentType,
  AllergySeverity,
  MedicalRecordStatus,
  PrescriptionStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  InventoryTransactionType,
  CommunicationChannel,
  CommunicationDirection,
  InsuranceClaimStatus,
  AuditAction,
  type Doctor,
  type Invoice,
} from "../generated/client";
import { DEFAULT_ROLE_PERMISSIONS } from "../src/permissions";
import { CLINIC_LISTINGS, VERIFIED_AT } from "./data/clinic-directory";

const prisma = new PrismaClient();

async function seedClinicDirectory() {
  console.log(`Seeding public clinic directory (${CLINIC_LISTINGS.length} sourced listings)...`);
  for (const listing of CLINIC_LISTINGS) {
    await prisma.clinicListing.upsert({
      where: { slug: listing.slug },
      update: {},
      create: {
        slug: listing.slug,
        name: listing.name,
        specialties: listing.specialties,
        city: listing.city,
        neighborhood: listing.neighborhood ?? null,
        address: listing.address ?? null,
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
        googleMapsUrl:
          listing.latitude != null && listing.longitude != null
            ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`
            : null,
        phone: listing.phone ?? null,
        status: "ACTIVE",
        sourceUrl: listing.sourceUrl,
        sourceType: "PUBLIC_DIRECTORY",
        verifiedAt: VERIFIED_AT,
      },
    });
  }
}

const DEMO_PASSWORD = "Passw0rd!123";

async function hash(password: string) {
  return argon2.hash(password);
}

async function main() {
  console.log("Seeding MBN Health demo data...");
  const passwordHash = await hash(DEMO_PASSWORD);

  // ── Platform-level Super Admin (no tenant) ────────────────────────────────
  let superAdminRole = await prisma.role.findFirst({
    where: { tenantId: null, name: "Super Admin" },
  });
  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        tenantId: null,
        name: "Super Admin",
        systemRole: SystemRoleName.SUPER_ADMIN,
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
      },
    });
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { tenantId: null, email: "superadmin@mbnhealth.com" },
  });
  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        tenantId: null,
        email: "superadmin@mbnhealth.com",
        passwordHash,
        firstName: "MBN",
        lastName: "Platform Admin",
        roleId: superAdminRole.id,
        emailVerifiedAt: new Date(),
      },
    });
  }

  // ── Demo tenant ────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-clinic" },
    update: {},
    create: {
      name: "MBN Demo Medical Center",
      slug: "demo-clinic",
      primaryColor: "#0EA5E9",
      timezone: "Africa/Casablanca",
      address: "123 Boulevard Zerktouni, Casablanca, Morocco",
      city: "Casablanca",
      phone: "+212 522 000 000",
      email: "contact@demo-clinic.mbnhealth.com",
      subscription: {
        create: {
          plan: "PROFESSIONAL",
          status: "ACTIVE",
          seats: 25,
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      },
    },
  });

  // ── Roles for the tenant ───────────────────────────────────────────────────
  const roleEntries = await Promise.all(
    (Object.keys(DEFAULT_ROLE_PERMISSIONS) as SystemRoleName[])
      .filter((r) => r !== SystemRoleName.SUPER_ADMIN)
      .map(async (systemRole) => {
        const name = systemRole
          .split("_")
          .map((w) => w[0] + w.slice(1).toLowerCase())
          .join(" ");
        const role = await prisma.role.upsert({
          where: { tenantId_name: { tenantId: tenant.id, name } },
          update: {},
          create: {
            tenantId: tenant.id,
            name,
            systemRole,
            isSystem: true,
            permissions: DEFAULT_ROLE_PERMISSIONS[systemRole],
          },
        });
        return [systemRole, role] as const;
      }),
  );
  const roleByName = Object.fromEntries(roleEntries) as Record<
    Exclude<SystemRoleName, "SUPER_ADMIN">,
    (typeof roleEntries)[number][1]
  >;

  // ── Departments ─────────────────────────────────────────────────────────────
  const [generalMedicine, pediatrics, cardiology, dermatology] = await Promise.all(
    ["General Medicine", "Pediatrics", "Cardiology", "Dermatology"].map((name, i) =>
      prisma.department.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name } },
        update: {},
        create: {
          tenantId: tenant.id,
          name,
          color: ["#0EA5E9", "#F97316", "#EF4444", "#8B5CF6"][i],
        },
      }),
    ),
  );

  // ── Users & staff ───────────────────────────────────────────────────────────
  const clinicOwner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "owner@demo-clinic.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "owner@demo-clinic.com",
      passwordHash,
      firstName: "Amina",
      lastName: "Bennani",
      roleId: roleByName.CLINIC_OWNER.id,
      emailVerifiedAt: new Date(),
    },
  });

  const manager = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "manager@demo-clinic.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "manager@demo-clinic.com",
      passwordHash,
      firstName: "Yassine",
      lastName: "El Idrissi",
      roleId: roleByName.MANAGER.id,
      emailVerifiedAt: new Date(),
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "reception@demo-clinic.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "reception@demo-clinic.com",
      passwordHash,
      firstName: "Salma",
      lastName: "Fassi",
      roleId: roleByName.RECEPTIONIST.id,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "accountant@demo-clinic.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "accountant@demo-clinic.com",
      passwordHash,
      firstName: "Karim",
      lastName: "Tazi",
      roleId: roleByName.ACCOUNTANT.id,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "lab@demo-clinic.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "lab@demo-clinic.com",
      passwordHash,
      firstName: "Nadia",
      lastName: "Chraibi",
      roleId: roleByName.LABORATORY.id,
      emailVerifiedAt: new Date(),
    },
  });

  const doctorUsersData = [
    { first: "Hicham", last: "Alaoui", dept: generalMedicine, spec: "Internal Medicine" },
    { first: "Fatima", last: "Zahra Cherkaoui", dept: pediatrics, spec: "Pediatrics" },
    { first: "Omar", last: "Benjelloun", dept: cardiology, spec: "Cardiology" },
    { first: "Laila", last: "Squalli", dept: dermatology, spec: "Dermatology" },
  ];

  const doctors: Doctor[] = [];
  for (const d of doctorUsersData) {
    const email = `dr.${d.first.toLowerCase().split(" ")[0]}@demo-clinic.com`;
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email,
        passwordHash,
        firstName: d.first,
        lastName: d.last,
        roleId: roleByName.DOCTOR.id,
        emailVerifiedAt: new Date(),
      },
    });
    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: user.id,
        departmentId: d.dept.id,
        specialization: d.spec,
        licenseNumber: `MED-${Math.floor(10000 + Math.random() * 89999)}`,
        consultationFee: 350,
        workingHours: {
          mon: ["09:00", "17:00"],
          tue: ["09:00", "17:00"],
          wed: ["09:00", "17:00"],
          thu: ["09:00", "17:00"],
          fri: ["09:00", "13:00"],
        },
      },
    });
    doctors.push(doctor);
  }

  // ── Patients ─────────────────────────────────────────────────────────────
  const patientsData = [
    { first: "Youssef", last: "Idrissi", dob: "1988-04-12", gender: Gender.MALE, blood: "O+" },
    { first: "Sara", last: "El Amrani", dob: "1995-11-03", gender: Gender.FEMALE, blood: "A+" },
    { first: "Khalid", last: "Ziani", dob: "1972-01-27", gender: Gender.MALE, blood: "B-" },
    { first: "Nour", last: "Bakkali", dob: "2001-08-19", gender: Gender.FEMALE, blood: "AB+" },
    { first: "Mehdi", last: "Ouazzani", dob: "1990-06-30", gender: Gender.MALE, blood: "O-" },
    { first: "Imane", last: "Slaoui", dob: "1983-02-14", gender: Gender.FEMALE, blood: "A-" },
    { first: "Adil", last: "Berrada", dob: "1979-09-05", gender: Gender.MALE, blood: "AB-" },
    { first: "Hafsa", last: "Naciri", dob: "1998-12-22", gender: Gender.FEMALE, blood: "O+" },
    { first: "Rachid", last: "Lahlou", dob: "1965-03-17", gender: Gender.MALE, blood: "A+" },
    { first: "Meryem", last: "Kabbaj", dob: "1992-07-08", gender: Gender.FEMALE, blood: "B+" },
    { first: "Anas", last: "Filali", dob: "1986-10-29", gender: Gender.MALE, blood: "O+" },
    { first: "Zineb", last: "Bouzidi", dob: "2004-05-16", gender: Gender.FEMALE, blood: "A-" },
    { first: "Hamza", last: "Sefrioui", dob: "1975-01-11", gender: Gender.MALE, blood: "B-" },
    { first: "Ghita", last: "El Fassi", dob: "1989-08-24", gender: Gender.FEMALE, blood: "AB+" },
  ];

  const patients = [];
  let mrnCounter = 1000;
  for (const p of patientsData) {
    const mrn = `MRN-${mrnCounter++}`;
    const patient = await prisma.patient.upsert({
      where: { tenantId_mrn: { tenantId: tenant.id, mrn } },
      update: {},
      create: {
        tenantId: tenant.id,
        mrn,
        firstName: p.first,
        lastName: p.last,
        dob: new Date(p.dob),
        gender: p.gender,
        bloodType: p.blood,
        phone: `+212 6${Math.floor(10000000 + Math.random() * 89999999)}`,
        email: `${p.first.toLowerCase()}.${p.last.toLowerCase().replace(/\s/g, "")}@example.com`,
        address: "Casablanca, Morocco",
        emergencyContactName: "Emergency Contact",
        emergencyContactPhone: "+212 600000000",
        emergencyContactRelation: "Spouse",
        insuranceProvider: "CNSS",
        insurancePolicyNumber: `CNSS-${Math.floor(100000 + Math.random() * 899999)}`,
        allergies: {
          create:
            Math.random() > 0.5
              ? [{ substance: "Penicillin", reaction: "Rash", severity: AllergySeverity.MODERATE }]
              : [],
        },
        medications: {
          create:
            Math.random() > 0.6
              ? [{ name: "Metformin", dosage: "500mg", frequency: "2x daily" }]
              : [],
        },
        vitals: {
          create: [
            {
              temperatureC: 36.8,
              bloodPressureSystolic: 118,
              bloodPressureDiastolic: 76,
              heartRate: 72,
              respiratoryRate: 16,
              oxygenSaturation: 98,
              weightKg: 70,
              heightCm: 172,
              bmi: 23.7,
            },
          ],
        },
      },
    });
    patients.push(patient);
  }

  // ── Appointments ─────────────────────────────────────────────────────────
  const now = new Date();
  const statuses = [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.WAITING,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ];

  const appointments = [];
  for (let i = 0; i < 30; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const dayOffset = i - 10;
    const start = new Date(now);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(9 + (i % 8), 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    const appointment = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        doctorId: doctor.id,
        type: i % 5 === 0 ? AppointmentType.FOLLOW_UP : AppointmentType.CONSULTATION,
        status: statuses[i % statuses.length],
        startTime: start,
        endTime: end,
        reason: "Routine consultation",
        createdById: receptionist.id,
      },
    });
    appointments.push(appointment);
  }

  // ── Medical records, diagnoses, prescriptions for completed appointments ──
  const completed = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED);
  const invoices: Invoice[] = [];
  for (const [invoiceIndex, appt] of completed.entries()) {
    const record = await prisma.medicalRecord.create({
      data: {
        tenantId: tenant.id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        appointmentId: appt.id,
        visitDate: appt.startTime,
        subjective: "Patient reports mild headache and fatigue for 3 days.",
        objective: "BP 120/80, HR 76, afebrile. No acute distress.",
        assessment: "Tension headache, likely stress-related.",
        plan: "Recommend rest, hydration, OTC analgesics. Follow up in 2 weeks if symptoms persist.",
        status: MedicalRecordStatus.FINALIZED,
        diagnoses: {
          create: [{ icdCode: "R51", description: "Headache", isPrimary: true }],
        },
      },
    });

    await prisma.prescription.create({
      data: {
        tenantId: tenant.id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        medicalRecordId: record.id,
        status: PrescriptionStatus.ACTIVE,
        items: {
          create: [
            {
              drugName: "Paracetamol",
              dosage: "500mg",
              frequency: "Every 6 hours as needed",
              duration: "5 days",
              quantity: 20,
              instructions: "Take with food",
            },
          ],
        },
      },
    });

    const invoiceStatus = [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE][
      invoiceIndex % 3
    ];
    const paidAmount = invoiceStatus === "PAID" ? 350 : invoiceStatus === "PARTIALLY_PAID" ? 150 : 0;
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        patientId: appt.patientId,
        invoiceNumber: `INV-${appt.id.slice(-6).toUpperCase()}`,
        status: invoiceStatus,
        dueDate: invoiceStatus === "OVERDUE" ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) : new Date(),
        subtotal: 350,
        taxAmount: 0,
        totalAmount: 350,
        paidAmount,
        items: {
          create: [
            {
              description: "Consultation fee",
              serviceType: "CONSULTATION",
              quantity: 1,
              unitPrice: 350,
              total: 350,
            },
          ],
        },
        payments: paidAmount
          ? {
              create: [
                {
                  tenantId: tenant.id,
                  amount: paidAmount,
                  method: PaymentMethod.CARD,
                  status: PaymentStatus.COMPLETED,
                },
              ],
            }
          : undefined,
      },
    });
    invoices.push(invoice);
  }

  // ── Insurance claims for a couple of invoices ─────────────────────────────
  for (const invoice of invoices.slice(0, 2)) {
    await prisma.insuranceClaim.create({
      data: {
        tenantId: tenant.id,
        patientId: invoice.patientId,
        invoiceId: invoice.id,
        provider: "CNSS",
        policyNumber: `CNSS-${Math.floor(100000 + Math.random() * 899999)}`,
        claimAmount: invoice.totalAmount,
        approvedAmount: invoice.status === "PAID" ? invoice.totalAmount : null,
        status: invoice.status === "PAID" ? InsuranceClaimStatus.APPROVED : InsuranceClaimStatus.IN_REVIEW,
      },
    });
  }

  // ── Lab / Radiology orders (thin modules) ─────────────────────────────────
  await prisma.labOrder.createMany({
    data: patients.slice(0, 3).map((p, i) => ({
      tenantId: tenant.id,
      patientId: p.id,
      doctorId: doctors[i % doctors.length].id,
      testName: ["Complete Blood Count", "Lipid Panel", "Thyroid Function Test"][i],
      status: [OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS, OrderStatus.ORDERED][i],
    })),
  });

  await prisma.radiologyOrder.createMany({
    data: patients.slice(0, 2).map((p, i) => ({
      tenantId: tenant.id,
      patientId: p.id,
      doctorId: doctors[i % doctors.length].id,
      examType: ["Chest X-Ray", "Abdominal Ultrasound"][i],
      status: [OrderStatus.COMPLETED, OrderStatus.ORDERED][i],
    })),
  });

  // ── Inventory ──────────────────────────────────────────────────────────────
  const inventoryData = [
    { name: "Disposable Syringes 5ml", sku: "SYR-5ML", category: "Supplies", qty: 500, reorder: 100 },
    { name: "Paracetamol 500mg", sku: "MED-PARA500", category: "Medication", qty: 40, reorder: 50 },
    { name: "Surgical Gloves (Box)", sku: "GLV-BOX", category: "Supplies", qty: 120, reorder: 30 },
    { name: "Bandages", sku: "BND-STD", category: "Supplies", qty: 200, reorder: 50 },
  ];
  for (const item of inventoryData) {
    const inv = await prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.qty,
        unit: "unit",
        reorderLevel: item.reorder,
        unitCost: 5.5,
        supplier: "MedSupply Co.",
      },
    });
    await prisma.inventoryTransaction.create({
      data: {
        itemId: inv.id,
        type: InventoryTransactionType.RESTOCK,
        quantity: item.qty,
        reason: "Initial stock",
      },
    });
  }

  // ── Messaging templates & notifications ───────────────────────────────────
  await prisma.messageTemplate.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: "Appointment Confirmation (Email)",
        channel: CommunicationChannel.EMAIL,
        subject: "Your appointment is confirmed",
        body: "Dear {{patientName}}, your appointment on {{date}} at {{time}} has been confirmed.",
      },
      {
        tenantId: tenant.id,
        name: "Appointment Reminder (WhatsApp)",
        channel: CommunicationChannel.WHATSAPP,
        body: "Hi {{patientName}}, this is a reminder for your appointment with Dr. {{doctorName}} on {{date}} at {{time}}. Reply to this message if you have any questions.",
      },
    ],
    skipDuplicates: true,
  });

  // Demo WhatsApp Business config (inactive placeholder — no real Meta
  // credentials in this environment; the clinic owner fills these in from
  // Settings > WhatsApp Bot once they have a real Meta Business account).
  await prisma.whatsAppConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      phoneNumberId: `demo-phone-number-id-${tenant.id.slice(-6)}`,
      accessToken: "REPLACE_WITH_REAL_META_ACCESS_TOKEN",
      isActive: false,
      aiBotEnabled: true,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: clinicOwner.id,
        title: "Weekly report ready",
        body: "Your clinic's weekly performance report is ready to view.",
        type: "INFO",
      },
      {
        tenantId: tenant.id,
        userId: manager.id,
        title: "Low inventory alert",
        body: "Paracetamol 500mg is below reorder level.",
        type: "WARNING",
      },
      {
        tenantId: tenant.id,
        userId: receptionist.id,
        title: "New appointment booked",
        body: "A new appointment was booked for today.",
        type: "SUCCESS",
      },
    ],
  });

  // ── Internal staff chat (thin module) ─────────────────────────────────────
  const staffThread = await prisma.messageThread.create({
    data: {
      tenantId: tenant.id,
      subject: "Front desk — this week",
      participants: {
        create: [{ userId: clinicOwner.id }, { userId: manager.id }, { userId: receptionist.id }],
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { threadId: staffThread.id, senderId: manager.id, body: "Can someone confirm the 9am slots for tomorrow?" },
      { threadId: staffThread.id, senderId: receptionist.id, body: "Done — all confirmed except Mr. Ziani, still trying to reach him." },
      { threadId: staffThread.id, senderId: clinicOwner.id, body: "Thanks both, great work this week." },
    ],
  });

  // ── WhatsApp communication log (simulated sends — see WhatsAppConfig above) ─
  const upcoming = appointments.filter((a) => a.startTime > now).slice(0, 4);
  await prisma.communicationLog.createMany({
    data: upcoming.map((appt) => ({
      tenantId: tenant.id,
      patientId: appt.patientId,
      appointmentId: appt.id,
      channel: CommunicationChannel.WHATSAPP,
      direction: CommunicationDirection.OUTBOUND,
      externalContact: "+212 6XXXXXXXX",
      content: "Reminder: you have an appointment tomorrow. Reply if you need to reschedule.",
      status: "SIMULATED",
    })),
  });
  await prisma.communicationLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        patientId: patients[0].id,
        channel: CommunicationChannel.WHATSAPP,
        direction: CommunicationDirection.INBOUND,
        externalContact: "+212 6XXXXXXXX",
        content: "What time is the clinic open on Saturday?",
        status: "RECEIVED",
      },
      {
        tenantId: tenant.id,
        patientId: patients[0].id,
        channel: CommunicationChannel.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        externalContact: "+212 6XXXXXXXX",
        content: "We're open Saturdays 9am-1pm. Would you like to book an appointment?",
        status: "SIMULATED",
        respondedByAi: true,
      },
    ],
  });

  // ── Audit trail (so the Audit Logs screen isn't empty in the demo) ────────
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: clinicOwner.id,
        action: AuditAction.LOGIN,
        entityType: "User",
        entityId: clinicOwner.id,
        ipAddress: "197.230.10.5",
        userAgent: "Mozilla/5.0",
      },
      {
        tenantId: tenant.id,
        userId: receptionist.id,
        action: AuditAction.CREATE,
        entityType: "Patient",
        entityId: patients[0].id,
        metadata: { mrn: patients[0].mrn },
      },
      {
        tenantId: tenant.id,
        userId: manager.id,
        action: AuditAction.UPDATE,
        entityType: "InventoryItem",
        metadata: { name: "Paracetamol 500mg", change: "reorder alert triggered" },
      },
      {
        tenantId: tenant.id,
        userId: clinicOwner.id,
        action: AuditAction.EXPORT,
        entityType: "Report",
        metadata: { report: "monthly-revenue" },
      },
    ],
  });

  // ── A second, smaller clinic in a different city ──────────────────────────
  // Exists purely so the public patient-portal search/city/specialty filters
  // have real variety to demonstrate — not a full operational demo like
  // demo-clinic above (no receptionist/accountant/lab staff, no patients).
  const rabatTenant = await prisma.tenant.upsert({
    where: { slug: "clinique-atlas-rabat" },
    update: {},
    create: {
      name: "Clinique Atlas Rabat",
      slug: "clinique-atlas-rabat",
      primaryColor: "#8B5CF6",
      timezone: "Africa/Casablanca",
      address: "45 Avenue Fal Ould Oumeir, Rabat, Morocco",
      city: "Rabat",
      phone: "+212 537 000 111",
      email: "contact@clinique-atlas.mbnhealth.com",
      subscription: {
        create: {
          plan: "STARTER",
          status: "ACTIVE",
          seats: 5,
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      },
    },
  });

  const rabatOwnerRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: rabatTenant.id, name: "Clinic Owner" } },
    update: {},
    create: {
      tenantId: rabatTenant.id,
      name: "Clinic Owner",
      systemRole: SystemRoleName.CLINIC_OWNER,
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.CLINIC_OWNER,
    },
  });
  const rabatDoctorRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: rabatTenant.id, name: "Doctor" } },
    update: {},
    create: {
      tenantId: rabatTenant.id,
      name: "Doctor",
      systemRole: SystemRoleName.DOCTOR,
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.DOCTOR,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: rabatTenant.id, email: "owner@clinique-atlas.com" } },
    update: {},
    create: {
      tenantId: rabatTenant.id,
      email: "owner@clinique-atlas.com",
      passwordHash,
      firstName: "Youssef",
      lastName: "Bennis",
      roleId: rabatOwnerRole.id,
      emailVerifiedAt: new Date(),
    },
  });

  const rabatDepartments = await Promise.all(
    ["Orthopedics", "Ophthalmology"].map((name, i) =>
      prisma.department.upsert({
        where: { tenantId_name: { tenantId: rabatTenant.id, name } },
        update: {},
        create: { tenantId: rabatTenant.id, name, color: ["#8B5CF6", "#0EA5E9"][i] },
      }),
    ),
  );

  const rabatDoctorsData = [
    { first: "Amine", last: "Chraibi", dept: rabatDepartments[0], spec: "Orthopedics" },
    { first: "Sanaa", last: "Belhaj", dept: rabatDepartments[1], spec: "Ophthalmology" },
  ];
  for (const d of rabatDoctorsData) {
    const email = `dr.${d.first.toLowerCase()}@clinique-atlas.com`;
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: rabatTenant.id, email } },
      update: {},
      create: {
        tenantId: rabatTenant.id,
        email,
        passwordHash,
        firstName: d.first,
        lastName: d.last,
        roleId: rabatDoctorRole.id,
        emailVerifiedAt: new Date(),
      },
    });
    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        tenantId: rabatTenant.id,
        userId: user.id,
        departmentId: d.dept.id,
        specialization: d.spec,
        licenseNumber: `MED-${Math.floor(10000 + Math.random() * 89999)}`,
        consultationFee: 300,
        workingHours: {
          mon: ["09:00", "17:00"],
          tue: ["09:00", "17:00"],
          wed: ["09:00", "17:00"],
          thu: ["09:00", "1