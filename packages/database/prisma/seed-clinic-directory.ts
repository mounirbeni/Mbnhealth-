import { PrismaClient } from "../generated/client";
import { CLINIC_LISTINGS, VERIFIED_AT } from "./data/clinic-directory";

export async function seedClinicDirectory(prisma: PrismaClient) {
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
        verifiedAt: listing.verifiedAt ?? VERIFIED_AT,
      },
    });
  }
}

// Standalone entry point — `npm run seed:clinic-directory` — for seeding just
// the public clinic directory against a database that already has real
// tenant/patient data (e.g. production), without touching anything else the
// way the full seed.ts demo dataset would.
if (require.main === module) {
  const prisma = new PrismaClient();
  seedClinicDirectory(prisma)
    .then(() => {
      console.log("Clinic directory seed complete.");
      return prisma.$disconnect();
    })
    .catch(async (err) => {
      console.error(err);
      await prisma.$disconnect();
      process.exit(1);
    });
}
