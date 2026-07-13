// Curated, sourced dataset of real private clinics (cabinets médicaux) in
// Morocco for the public "Find a Clinic" directory.
//
// SCOPE: this is a starter set for two cities (Casablanca, Rabat), not a
// nationwide catalog — expanding coverage requires the same
// research-and-verify process for each additional city.
//
// PROVENANCE: every record was compiled from the individual clinic listing
// page on www.pharmacieenpermanence.ma (a public Moroccan medical directory)
// on 2026-07-13. `sourceUrl` on each record points at the exact page used.
// Only fields that were present on that source page are filled in — fields
// the source didn't publish (email, website, opening hours, photos, rating,
// review count, languages, pricing, accessibility) are deliberately left
// empty rather than guessed, per MBN Health's no-fabrication data policy.
// GPS coordinates are only included for listings where the source page
// published an embedded map; the rest are left null.
//
// Before this data is shown to real patients in production, each listing
// should also be spot-checked against Google Maps / the clinic's own
// channels and, ideally, a confirmation call — `verifiedAt` here reflects
// only that the record matches its `sourceUrl` as of the date above, not an
// independent call to the clinic.

export const VERIFIED_AT = new Date("2026-07-13T00:00:00.000Z");
const SOURCE = "https://www.pharmacieenpermanence.ma";

export interface ClinicListingSeed {
  slug: string;
  name: string;
  specialties: string[];
  city: string;
  neighborhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  sourceUrl: string;
}

export const CLINIC_LISTINGS: ClinicListingSeed[] = [
  // ── Casablanca ────────────────────────────────────────────────────────────
  {
    slug: "cabinet-gynecologie-obstetrique-harit-amjad-casablanca",
    name: "Cabinet de Gynécologie-Obstétrique et Fertilité – Dr Harit Amjad",
    specialties: ["Gynécologie-Obstétrique"],
    city: "Casablanca",
    address: "Étage 4, N8, 110 Avenue des Forces Auxiliaires, Casablanca",
    latitude: 33.569934,
    longitude: -7.557282,
    phone: "0808674946",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/cabinet-de-gynecologie-obstetrique-et-fertilite-dr-harit-amjad`,
  },
  {
    slug: "cabinet-cardiologie-ammouri-zaid-casablanca",
    name: "Cabinet de Cardiologie – Dr. Ammouri Zaid",
    specialties: ["Cardiologie"],
    city: "Casablanca",
    neighborhood: "Aïn Chock",
    address: "2e étage, N°18A, Business Square Tah, Immeuble A, Beaux Jardins, Angle Bd Tah, Aïn Chock, Casablanca",
    latitude: 33.535537,
    longitude: -7.576269,
    phone: "0522525959",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/cabinet-de-cardiologie-dr-ammouri-zaid`,
  },
  {
    slug: "cabinet-neurologie-habtany-youness-casablanca",
    name: "Cabinet de Neurologie – Dr Habtany Youness",
    specialties: ["Neurologie"],
    city: "Casablanca",
    neighborhood: "Sidi Moumen",
    address: "1er étage, Résidence Safiya 2, 11 Boulevard Mohamed Zefzaf, Sidi Moumen, Casablanca",
    phone: "0522110334",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/neurologue-dr-habtany-youness`,
  },
  {
    slug: "dr-siham-zaimi-cardiologue-cardiopediatre-casablanca",
    name: "Dr Siham Zaïmi – Cardiologue / Cardiopédiatre",
    specialties: ["Cardiologie", "Cardiologie pédiatrique"],
    city: "Casablanca",
    neighborhood: "Maarif",
    address: "Ghandi Mall (Iboma), Immeuble 7 Boulevard Ghandi, Maarif, Casablanca",
    latitude: 33.574755,
    longitude: -7.65032,
    phone: "0522255356",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/dr-siham-zaimi-cardiologue-cardiopediatre`,
  },
  {
    slug: "dr-sahnoun-abderrazak-urologue-casablanca",
    name: "Dr Sahnoun Abderrazak – Urologue",
    specialties: ["Urologie"],
    city: "Casablanca",
    address: "Boulevard Nil, Bloc 37 N°49, Casablanca",
    phone: "0522383835",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/dr-sahnoun-abderrazak-urologue`,
  },
  {
    slug: "dr-hafssa-chehab-dermatologue-casablanca",
    name: "Dr Hafssa Chehab – Dermatologue",
    specialties: ["Dermatologie", "Médecine esthétique"],
    city: "Casablanca",
    neighborhood: "Aïn Chock",
    address: "Angle Rue 14 et Boulevard Panoramique, Aïn Chock, Casablanca",
    latitude: 33.556677,
    longitude: -7.596214,
    phone: "0620773161",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/dr-hafssa-chehab-dermatologue-panoramique-ainchock-peau-ongles-et-cheveux-medecine-esthetique`,
  },
  {
    slug: "cabinet-orl-wydadi-omar-casablanca",
    name: "Cabinet ORL – Dr Wydadi Omar",
    specialties: ["ORL (Oto-rhino-laryngologie)"],
    city: "Casablanca",
    address: "Boulevard Abou Bakar El Kadiri, Projet Panorama, Immeuble 1, Bureau 13, 3e étage, Casablanca",
    phone: "0667852007",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/cabinet-orl-dr-wydadi-omar-casablanca`,
  },
  {
    slug: "dr-khedim-nesrine-dermatologue-casablanca",
    name: "Dr Khedim Nesrine – Dermatologue",
    specialties: ["Dermatologie"],
    city: "Casablanca",
    neighborhood: "Foncière",
    address: "2e étage, 59 Boulevard Emile Zola, Foncière, Casablanca",
    phone: "0520760496",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/dr-khedim-nesrine-dermatologue`,
  },
  {
    slug: "centre-ophtalmologie-ghandi-attabari-casablanca",
    name: "Centre d'Ophtalmologie Ghandi Attabari – Dr Hanane Atidi",
    specialties: ["Ophtalmologie"],
    city: "Casablanca",
    neighborhood: "Maarif",
    address: "1er étage, Bureau 3, Attabari Business Center, 134 Rue Attabari, Maarif, Casablanca",
    latitude: 33.575993,
    longitude: -7.649191,
    phone: "0522942950",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/centre-d-ophtalmologie-ghandi-attabari-dr-hanane-atidi`,
  },
  {
    slug: "centre-traumatologie-orthopedie-ouabid-abdallah-casablanca",
    name: "Centre de Traumatologie et Orthopédie – Dr Ouabid Abdallah",
    specialties: ["Orthopédie", "Traumatologie"],
    city: "Casablanca",
    neighborhood: "Maarif",
    address: "2e étage N°4, 17 Rue Abou Moussa El Jazouli, Maarif, Casablanca",
    phone: "0521237995",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/centre-traumatologie-et-orthopedie-dr-ouabid-abdallah`,
  },
  {
    slug: "cabinet-hepato-gastro-enterologie-nachit-merieme-casablanca",
    name: "Cabinet d'Hépato-Gastro-Entérologie – Dr Nachit Merième",
    specialties: ["Hépato-Gastro-Entérologie"],
    city: "Casablanca",
    neighborhood: "Al Fida",
    address: "Avenue Abdellah Senhaji, Al Fida, Casablanca",
    latitude: 33.571556,
    longitude: -7.593997,
    phone: "0522801005",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/cabinet-d-hepato-gastro-enterologie-dr-nachit-merieme`,
  },
  {
    slug: "dr-hamza-jabir-oncologue-radiotherapeute-casablanca",
    name: "Dr Hamza Jabir – Oncologue-Radiothérapeute",
    specialties: ["Oncologie", "Radiothérapie"],
    city: "Casablanca",
    neighborhood: "Maarif",
    address: "Appartement 14, 3e étage, Résidence Ryad Abdelmoumen, 445A Boulevard Abdelmoumen, Maarif, Casablanca",
    phone: "0522865568",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/casablanca/docteur-hamza-jabir-oncologue-radiotherapeute-cancerologue-depistage-et-diagnostic-des-cancers-traitement-de-la-douleur-soins`,
  },

  // ── Rabat ─────────────────────────────────────────────────────────────────
  {
    slug: "cabinet-iraqi-ghita-nutrition-medicale-rabat",
    name: "Cabinet Dr Iraqi Ghita – Nutrition Médicale",
    specialties: ["Nutrition médicale"],
    city: "Rabat",
    neighborhood: "Hay Riad",
    address: "Rue Annaranj, Hay Riad, Rabat",
    phone: "0649334733",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/cabinet-dr-iraqi-ghita-de-nutrition-medicale`,
  },
  {
    slug: "cabinet-medical-fathi-sana-rabat",
    name: "Cabinet Médical – Dr Fathi Sana",
    specialties: [],
    city: "Rabat",
    neighborhood: "Agdal",
    address: "Appartement 9, Immeuble 60 Rue Jabal Oukaïmeden, Agdal, Rabat",
    latitude: 33.9949,
    longitude: -6.850211,
    phone: "0670709383",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/cabinet-medical-dr-fathi-sana`,
  },
  {
    slug: "dr-hamza-zarouf-psychiatre-rabat",
    name: "Dr Hamza Zarouf – Psychiatre-Psychothérapeute",
    specialties: ["Psychiatrie"],
    city: "Rabat",
    neighborhood: "Agdal",
    address: "1er étage, 86 Avenue des Nations Unies, Agdal, Rabat",
    phone: "0537686418",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-hamza-zarouf-i-psychiatre-psychotherapeute`,
  },
  {
    slug: "cabinet-pediatrie-boukhzar-malak-rabat",
    name: "Cabinet de Pédiatrie – Dr Boukhzar Malak",
    specialties: ["Pédiatrie"],
    city: "Rabat",
    neighborhood: "CYM",
    address: "Appartement 1, 23 Avenue Al Kifah, CYM, Rabat",
    latitude: 33.990823,
    longitude: -6.874935,
    phone: "0537690003",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/cabinet-pediatrie-dr-boukhzar-malak`,
  },
  {
    slug: "dr-hanae-bakkali-cancerologie-al-wifaq-rabat",
    name: "Dr Hanae Bakkali – Cabinet de Cancérologie Al Wifaq",
    specialties: ["Oncologie", "Radiothérapie"],
    city: "Rabat",
    address: "Hôpital Universitaire International Mohammed VI, Rabat",
    phone: "0666124342",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-hanae-bakkali-cabinet-de-cancerologie-al-wifaq-oncologue-radiotherapeute`,
  },
  {
    slug: "dr-ouazzani-nabil-traumatologue-rabat",
    name: "Dr Ouazzani Nabil – Traumatologue",
    specialties: ["Traumatologie", "Orthopédie"],
    city: "Rabat",
    neighborhood: "Agdal",
    address: "Avenue Oqba, Rue Oued Sebou, Agdal, Rabat",
    phone: "0660713853",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-ouazzani-nabil-traumatologue`,
  },
  {
    slug: "cabinet-hepato-gastro-enterologie-el-hamdi-rabat",
    name: "Cabinet d'Hépato-Gastro-Entérologie – Dr El Hamdi Fatima Zahra",
    specialties: ["Hépato-Gastro-Entérologie"],
    city: "Rabat",
    neighborhood: "Quartier Hassan",
    address: "2e étage, Esc A, 8 Rue Amman, Quartier Hassan, Rabat",
    phone: "0537736809",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/cabinet-de-hepato-gastro-enterologie-dr-el-hamdi-fatima-zahra`,
  },
  {
    slug: "dr-zineb-benkerroum-gynecologue-rabat",
    name: "Dr Zineb Benkerroum – Gynécologue",
    specialties: ["Gynécologie"],
    city: "Rabat",
    neighborhood: "Quartier des Orangers",
    address: "Résidence Al Manar, Immeuble J, Appartement 3, Rez-de-chaussée, Avenue Hassan II, Quartier des Orangers, Rabat",
    latitude: 34.016758,
    longitude: -6.845296,
    phone: "0537700005",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-zineb-benkerroum-gynecologue`,
  },
  {
    slug: "dr-nejjar-rania-gynecologie-obstetrique-rabat",
    name: "Dr Nejjar Rania – Cabinet de Gynécologie-Obstétrique",
    specialties: ["Gynécologie-Obstétrique"],
    city: "Rabat",
    neighborhood: "Agdal",
    address: "Immeuble 1, Appartement 2, Angle Avenue Oqba et Rue Oum Errabia, Agdal, Rabat",
    latitude: 34.002948,
    longitude: -6.849744,
    phone: "0661640070",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-nejjar-rania-cabinet-de-gynecologie-obstetrique`,
  },
  {
    slug: "cabinet-cardiologie-el-bouhali-sara-rabat",
    name: "Cabinet de Cardiologie – Dr El Bouhali Sara",
    specialties: ["Cardiologie"],
    city: "Rabat",
    neighborhood: "Hay Nahda",
    address: "N°8, Hay Nahda 1, Avenue Réda Guédira, Résidence Al Kasbah, Immeuble E-4, Rabat",
    phone: "0537754294",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/cabinet-de-cardiologie-dr-el-bouhali-sara`,
  },
  {
    slug: "dr-siham-oudanane-ophtalmologue-rabat",
    name: "Dr Siham Oudanane – Ophtalmologue",
    specialties: ["Ophtalmologie"],
    city: "Rabat",
    address: "Rue Congo, Rabat",
    latitude: 34.018725,
    longitude: -6.844016,
    phone: "0537725252",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-siham-oudanane-ophtalmologue`,
  },
  {
    slug: "dr-bengebara-moncef-proctologue-rabat",
    name: "Dr Bengebara Moncef – Chirurgien Proctologue",
    specialties: ["Proctologie", "Chirurgie"],
    city: "Rabat",
    neighborhood: "Quartier Hassan",
    address: "352 Avenue Mohamed V, Quartier Hassan, Rabat",
    phone: "0661291040",
    sourceUrl: `${SOURCE}/docteur/cabinet-medical/rabat/dr-bengebara-moncef-chirurgien-proctologue`,
  },
];
