-- CreateEnum
CREATE TYPE "ClinicListingStatus" AS ENUM ('ACTIVE', 'UNVERIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClinicListingSourceType" AS ENUM ('GOOGLE_MAPS', 'OFFICIAL_WEBSITE', 'PUBLIC_DIRECTORY', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingInquiryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "clinic_listings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialties" TEXT[],
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "googleMapsUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "openingHours" JSONB,
    "languages" TEXT[],
    "rating" DECIMAL(2,1),
    "reviewCount" INTEGER,
    "consultationPriceMinMad" DECIMAL(10,2),
    "consultationPriceMaxMad" DECIMAL(10,2),
    "wheelchairAccessible" BOOLEAN,
    "acceptsInsurance" BOOLEAN,
    "aboutText" TEXT,
    "status" "ClinicListingStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceUrl" TEXT,
    "sourceType" "ClinicListingSourceType",
    "verifiedAt" TIMESTAMP(3),
    "claimedTenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_listing_photos" (
    "id" TEXT NOT NULL,
    "clinicListingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sourceUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_listing_doctors" (
    "id" TEXT NOT NULL,
    "clinicListingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "languages" TEXT[],
    "bio" TEXT,
    "qualifications" TEXT,
    "experienceText" TEXT,
    "consultationHours" TEXT,
    "photoUrl" TEXT,
    "registrationNumber" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_listing_doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_listing_faqs" (
    "id" TEXT NOT NULL,
    "clinicListingId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clinic_listing_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_listing_inquiries" (
    "id" TEXT NOT NULL,
    "clinicListingId" TEXT NOT NULL,
    "patientAccountId" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "preferredDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "ListingInquiryStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_listing_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_listings_slug_key" ON "clinic_listings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_listings_claimedTenantId_key" ON "clinic_listings"("claimedTenantId");

-- CreateIndex
CREATE INDEX "clinic_listings_city_idx" ON "clinic_listings"("city");

-- CreateIndex
CREATE INDEX "clinic_listings_status_idx" ON "clinic_listings"("status");

-- CreateIndex
CREATE INDEX "clinic_listing_photos_clinicListingId_idx" ON "clinic_listing_photos"("clinicListingId");

-- CreateIndex
CREATE INDEX "clinic_listing_doctors_clinicListingId_idx" ON "clinic_listing_doctors"("clinicListingId");

-- CreateIndex
CREATE INDEX "clinic_listing_faqs_clinicListingId_idx" ON "clinic_listing_faqs"("clinicListingId");

-- CreateIndex
CREATE INDEX "clinic_listing_inquiries_clinicListingId_status_idx" ON "clinic_listing_inquiries"("clinicListingId", "status");

-- AddForeignKey
ALTER TABLE "clinic_listings" ADD CONSTRAINT "clinic_listings_claimedTenantId_fkey" FOREIGN KEY ("claimedTenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_listing_photos" ADD CONSTRAINT "clinic_listing_photos_clinicListingId_fkey" FOREIGN KEY ("clinicListingId") REFERENCES "clinic_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_listing_doctors" ADD CONSTRAINT "clinic_listing_doctors_clinicListingId_fkey" FOREIGN KEY ("clinicListingId") REFERENCES "clinic_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_listing_faqs" ADD CONSTRAINT "clinic_listing_faqs_clinicListingId_fkey" FOREIGN KEY ("clinicListingId") REFERENCES "clinic_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_listing_inquiries" ADD CONSTRAINT "clinic_listing_inquiries_clinicListingId_fkey" FOREIGN KEY ("clinicListingId") REFERENCES "clinic_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_listing_inquiries" ADD CONSTRAINT "clinic_listing_inquiries_patientAccountId_fkey" FOREIGN KEY ("patientAccountId") REFERENCES "patient_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
