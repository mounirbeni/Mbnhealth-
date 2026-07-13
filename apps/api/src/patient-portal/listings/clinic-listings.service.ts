import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchListingsDto } from "./dto/search-listings.dto";
import { CreateListingInquiryDto } from "./dto/create-listing-inquiry.dto";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function isOpenNow(openingHours: unknown): boolean | null {
  if (!openingHours || typeof openingHours !== "object") return null;
  const hours = openingHours as Record<string, [string, string]>;
  const now = new Date();
  const key = DAY_KEYS[now.getDay()];
  const today = hours[key];
  if (!today) return false;
  const [open, close] = today;
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= oh * 60 + om && minutesNow <= ch * 60 + cm;
}

/** Public-safe projection of a ClinicListing for search results / cards. */
function toCard(listing: {
  slug: string;
  name: string;
  specialties: string[];
  city: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  rating: unknown;
  reviewCount: number | null;
  wheelchairAccessible: boolean | null;
  acceptsInsurance: boolean | null;
  openingHours: unknown;
  photos: { url: string }[];
  claimedTenantId: string | null;
}) {
  return {
    slug: listing.slug,
    name: listing.name,
    specialties: listing.specialties,
    city: listing.city,
    neighborhood: listing.neighborhood,
    address: listing.address,
    phone: listing.phone,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    wheelchairAccessible: listing.wheelchairAccessible,
    acceptsInsurance: listing.acceptsInsurance,
    openNow: isOpenNow(listing.openingHours),
    coverPhotoUrl: listing.photos[0]?.url ?? null,
    isOnPlatform: Boolean(listing.claimedTenantId),
    source: "directory" as const,
  };
}

@Injectable()
export class ClinicListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: SearchListingsDto) {
    const where = {
      status: "ACTIVE" as const,
      ...(params.query
        ? {
            OR: [
              { name: { contains: params.query, mode: "insensitive" as const } },
              { address: { contains: params.query, mode: "insensitive" as const } },
              { specialties: { has: params.query } },
            ],
          }
        : {}),
      ...(params.specialty ? { specialties: { has: params.specialty } } : {}),
      ...(params.city ? { city: { equals: params.city, mode: "insensitive" as const } } : {}),
      ...(params.wheelchairAccessible === "true" ? { wheelchairAccessible: true } : {}),
      ...(params.acceptsInsurance === "true" ? { acceptsInsurance: true } : {}),
    };

    const orderBy =
      params.sort === "rating"
        ? [{ rating: "desc" as const }]
        : params.sort === "reviews"
          ? [{ reviewCount: "desc" as const }]
          : [{ name: "asc" as const }];

    const listings = await this.prisma.clinicListing.findMany({
      where,
      orderBy,
      take: 100,
      select: {
        slug: true,
        name: true,
        specialties: true,
        city: true,
        neighborhood: true,
        address: true,
        phone: true,
        rating: true,
        reviewCount: true,
        wheelchairAccessible: true,
        acceptsInsurance: true,
        openingHours: true,
        claimedTenantId: true,
        photos: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    let cards = listings.map(toCard);
    if (params.openNow === "true") {
      cards = cards.filter((c) => c.openNow === true);
    }
    return cards;
  }

  async getFilters() {
    const listings = await this.prisma.clinicListing.findMany({
      where: { status: "ACTIVE" },
      select: { city: true, specialties: true },
    });
    const cities = [...new Set(listings.map((l) => l.city))].sort();
    const specialties = [...new Set(listings.flatMap((l) => l.specialties))].sort();
    return { cities, specialties };
  }

  async getBySlug(slug: string) {
    const listing = await this.prisma.clinicListing.findFirst({
      where: { slug, status: "ACTIVE" },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        doctors: true,
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!listing) throw new NotFoundException("Clinic not found");

    const nearby = await this.prisma.clinicListing.findMany({
      where: {
        status: "ACTIVE",
        city: listing.city,
        id: { not: listing.id },
      },
      select: {
        slug: true,
        name: true,
        specialties: true,
        city: true,
        neighborhood: true,
        address: true,
        phone: true,
        rating: true,
        reviewCount: true,
        wheelchairAccessible: true,
        acceptsInsurance: true,
        openingHours: true,
        claimedTenantId: true,
        photos: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
      take: 4,
    });

    return {
      ...listing,
      isOnPlatform: Boolean(listing.claimedTenantId),
      nearby: nearby.map(toCard),
    };
  }

  async createInquiry(slug: string, dto: CreateListingInquiryDto, patientAccountId?: string) {
    const listing = await this.prisma.clinicListing.findFirst({ where: { slug, status: "ACTIVE" } });
    if (!listing) throw new NotFoundException("Clinic not found");
    if (dto.preferredDate && Number.isNaN(Date.parse(dto.preferredDate))) {
      throw new BadRequestException("preferredDate must be a valid date");
    }

    return this.prisma.clinicListingInquiry.create({
      data: {
        clinicListingId: listing.id,
        patientAccountId: patientAccountId ?? null,
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email ?? null,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
        notes: dto.notes ?? null,
      },
      select: { id: true, status: true, createdAt: true },
    });
  }
}
