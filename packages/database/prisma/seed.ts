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
} from "../generated/client";
import { DEFAULT_ROLE_PERMISSIONS } from "../src/permissions";

const prisma = new PrismaClient();

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
    where: { email: "owner@demo-clinic.com" },
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
    where: { email: "manager@demo-clinic.com" },
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
    where: { email: "reception@demo-clinic.com" },
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
    where: { email: "accountant@demo-clinic.com" },
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
    where: { email: "lab@demo-clinic.com" },
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

  const doctors = [];
  for (const d of doctorUsersData) {
    const email = `dr.${d.first.toLowerCase().split(" ")[0]}@demo-clinic.com`;
    const user = await prisma.user.upsert({
      where: { email },
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
  for (let i = 0; i < 20; i++) {
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
  for (const appt of completed) {
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

    await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        patientId: appt.patientId,
        invoiceNumber: `INV-${appt.id.slice(-6).toUpperCase()}`,
        status: InvoiceStatus.PAID,
        dueDate: new Date(),
        subtotal: 350,
        taxAmount: 0,
        totalAmount: 350,
        paidAmount: 350,
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
        payments: {
          create: [
            {
              tenantId: tenant.id,
              amount: 350,
              method: PaymentMethod.CARD,
              status: PaymentStatus.COMPLETED,
            },
          ],
        },
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

  console.log("Seed complete.");
  console.log("─────────────────────────────────────────");
  console.log("Demo login credentials (all roles share the password below):");
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log("  Super Admin:  superadmin@mbnhealth.com");
  console.log("  Clinic Owner: owner@demo-clinic.com");
  console.log("  Manager:      manager@demo-clinic.com");
  console.log("  Receptionist: reception@demo-clinic.com");
  console.log("  Accountant:   accountant@demo-clinic.com");
  console.log("  Laboratory:   lab@demo-clinic.com");
  console.log("  Doctor:       dr.hicham@demo-clinic.com");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
