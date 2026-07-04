-- CreateTable
CREATE TABLE "patient_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_account_links" (
    "id" TEXT NOT NULL,
    "patientAccountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_account_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_accounts_email_key" ON "patient_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_account_links_patientId_key" ON "patient_account_links"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_account_links_patientAccountId_tenantId_key" ON "patient_account_links"("patientAccountId", "tenantId");

-- AddForeignKey
ALTER TABLE "patient_account_links" ADD CONSTRAINT "patient_account_links_patientAccountId_fkey" FOREIGN KEY ("patientAccountId") REFERENCES "patient_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_account_links" ADD CONSTRAINT "patient_account_links_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_account_links" ADD CONSTRAINT "patient_account_links_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
