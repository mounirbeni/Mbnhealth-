export const LOCALES = ["en", "ar", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

// English is the default: it's the language the app was originally built and
// tested in, so new visitors keep seeing verified content unless they
// explicitly switch — the cookie below is what remembers their choice.
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "mbn_locale";

export const RTL_LOCALES: Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

// BCP-47 tags for Intl.DateTimeFormat/NumberFormat — Morocco-specific where
// it affects formatting conventions (e.g. Arabic-Indic vs. Western digits).
export const INTL_LOCALE_TAGS: Record<Locale, string> = {
  en: "en-GB",
  ar: "ar-MA",
  fr: "fr-FR",
};
