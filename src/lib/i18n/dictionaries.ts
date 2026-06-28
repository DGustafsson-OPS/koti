import { en } from "./en";
import { fi as fiRaw } from "./fi";
import { sv as svRaw } from "./sv";
import type { Dictionary, Locale } from "./types";

const fi = fiRaw as unknown as Dictionary;
const sv = svRaw as unknown as Dictionary;

const dictionaries: Record<Locale, Dictionary> = { en, fi, sv };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function categoryLabel(dict: Dictionary, key: string): string {
  const labels = dict.categories as Record<string, string>;
  return labels[key] ?? key;
}

export function priorityLabel(dict: Dictionary, key: string): string {
  const labels = dict.priorities as Record<string, string>;
  return labels[key] ?? key;
}

export function recurrenceLabel(dict: Dictionary, key: string): string {
  const labels = dict.recurrence as Record<string, string>;
  return labels[key] ?? key;
}

export function entityTypeLabel(dict: Dictionary, key: string): string {
  const labels = dict.entityTypes as Record<string, string>;
  return labels[key] ?? key;
}

export function propertyTypeLabel(dict: Dictionary, key: string): string {
  const labels = dict.propertyTypes as Record<string, string>;
  return labels[key] ?? key;
}

export function buildingTypeLabel(dict: Dictionary, key: string): string {
  const labels = dict.buildingTypes as Record<string, string>;
  return labels[key] ?? key;
}

export function dateLocale(locale: Locale): string {
  if (locale === "fi") return "fi-FI";
  if (locale === "sv") return "sv-FI";
  return "en-GB";
}

export function currencyLocale(locale: Locale): string {
  if (locale === "fi") return "fi-FI";
  if (locale === "sv") return "sv-FI";
  return "en-GB";
}
