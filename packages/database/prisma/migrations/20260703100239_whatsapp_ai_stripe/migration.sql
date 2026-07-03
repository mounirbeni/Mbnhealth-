-- Data cleanup before the enum type swap: SMS is being removed as a
-- communication channel in favor of the new WhatsApp bot integration.
-- Any existing rows referencing SMS are migrated to EMAIL so the enum
-- conversion below does not fail on old data.
UPDATE "message_templates" SET "channel" = 'EMAIL' WHERE "channel" = 'SMS';
UPDATE "communication_logs" SET "channel" = 'EMAIL' WHERE "channel" = 'SMS';

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- AlterEnum
BEGIN;
CREATE TYPE "CommunicationChannel_new" AS ENUM ('EMAIL', 'WHATSAPP', 'PUSH');
ALTER TABLE "message_templates" ALTER COLUMN "channel" TYPE "CommunicationChannel_new" USING ("channel"::text::"CommunicationChannel_new");
ALTER TABLE "communication_logs" ALTER COLUMN "channel" TYPE "CommunicationChannel_new" USING ("channel"::text::"CommunicationChannel_new");
ALTER TYPE "CommunicationChannel" RENAME TO "CommunicationChannel_old";
ALTER TYPE "CommunicationChannel_new" RENAME TO "CommunicationChannel";
DROP TYPE "CommunicationChannel_old";
COMMIT;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "communication_logs" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "direction" "CommunicationDirection" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "externalContact" TEXT,
ADD COLUMN     "externalMessageId" TEXT,
ADD COLUMN     "respondedByAi" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "whatsapp_configs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "businessAccountId" TEXT,
    "displayPhoneNumber" TEXT,
    "accessToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "aiBotEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_configs_tenantId_key" ON "whatsapp_configs"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_configs_phoneNumberId_key" ON "whatsapp_configs"("phoneNumberId");

-- CreateIndex
CREATE INDEX "appointments_reminderSentAt_startTime_idx" ON "appointments"("reminderSentAt", "startTime");

-- CreateIndex
CREATE INDEX "communication_logs_appointmentId_idx" ON "communication_logs"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_configs" ADD CONSTRAINT "whatsapp_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
