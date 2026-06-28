export type Locale = "en" | "fi" | "sv";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fi", label: "Suomi" },
  { value: "sv", label: "Svenska" },
];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "koti-locale";

export type Dictionary = typeof import("./en").en;

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale.value === value);
}
