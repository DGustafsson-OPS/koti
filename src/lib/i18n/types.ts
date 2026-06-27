export type Locale = "en" | "fi";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fi", label: "Suomi" },
];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "koti-locale";

export type Dictionary = typeof import("./en").en;
