import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// BCP 47 tags per app locale. Morocco variants keep Latin digits and the
// MAD-appropriate conventions for Arabic and French.
const INTL_LOCALES: Record<string, string> = { en: "en-US", fr: "fr-MA", ar: "ar-MA" };

// Set by LocaleProvider whenever the visitor's language changes; every
// consumer of the formatters below re-renders through the locale context,
// so reading module state at call time stays in sync.
let activeIntlLocale = INTL_LOCALES.en;

export function setFormatLocale(locale: string) {
  activeIntlLocale = INTL_LOCALES[locale] ?? INTL_LOCALES.en;
}

export function intlLocale() {
  return activeIntlLocale;
}

export function formatCurrency(amount: number, currency = "MAD") {
  return new Intl.NumberFormat(activeIntlLocale, { style: "currency", currency }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(activeIntlLocale, options ?? { dateStyle: "medium" }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat(activeIntlLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}
