-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "portalActivatedAt" TIMESTAMP(3),
ADD COLUMN     "portalPasswordHash" TEXT;

-- CreateTable
CREATE TABLE "patient_refresh_tokens" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_password_reset_tokens" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_refresh_tokens_tokenHash_key" ON "patient_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "patient_refresh_tokens_patientId_idx" ON "patient_refresh_tokens"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_password_reset_tokens_tokenHash_key" ON "patient_password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "patient_password_reset_tokens_patientId_idx" ON "patient_password_reset_tokens"("patientId");

-- AddForeignKey
ALTER TABLE "patient_refresh_tokens" ADD CONSTRAINT "patient_refresh_tokens_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_password_reset_tokens" ADD CONSTRAINT "patient_password_reset_tokens_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
