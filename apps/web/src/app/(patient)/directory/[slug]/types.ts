export interface ListingCard {
  slug: string;
  name: string;
  specialties: string[];
  city: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  rating: string | null;
  reviewCount: number | null;
  wheelchairAccessible: boolean | null;
  acceptsInsurance: boolean | null;
  openNow: boolean | null;
  coverPhotoUrl: string | null;
  isOnPlatform: boolean;
  doctorsCount: number;
}

export interface ListingDetail extends ListingCard {
  id: string;
  latitude: string | null;
  longitude: string | null;
  googleMapsUrl: string | null;
  email: string | null;
  website: string | null;
  openingHours: Record<string, [string, string]> | null;
  languages: string[];
  consultationPriceMinMad: string | null;
  consultationPriceMaxMad: string | null;
  aboutText: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  photos: { url: string; caption: string | null }[];
  doctors: {
    id: string;
    name: string;
    specialty: string | null;
    languages: string[];
    bio: string | null;
    qualifications: string | null;
    experienceText: string | null;
    consultationHours: string | null;
    photoUrl: string | null;
  }[];
  faqs: { id: string; question: string; answer: string }[];
  nearby: ListingCard[];
}
