import type { Locale } from "@/lib/i18n/types";
import { currencyLocale, dateLocale, getDictionary, interpolate } from "@/lib/i18n/dictionaries";

export function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function formatDate(
  timestamp: number | null | undefined,
  locale: Locale = "en"
): string {
  if (!timestamp) return getDictionary(locale).common.dash;
  return new Date(timestamp * 1000).toLocaleDateString(dateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(
  amount: number | null | undefined,
  locale: Locale = "en"
): string {
  if (amount == null) return getDictionary(locale).common.dash;
  return new Intl.NumberFormat(currencyLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDaysLeft(days: number, locale: Locale = "en"): string {
  return interpolate(getDictionary(locale).common.daysLeft, { n: days });
}

export function daysUntil(timestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.ceil((timestamp - now) / 86400);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-50 text-blue-700",
  urgent: "bg-red-50 text-red-700",
};

export const CATEGORY_LABELS: Record<string, string> = {
  paint: "Paint",
  flooring: "Flooring",
  tile: "Tile",
  filter: "Filter",
  hardware: "Hardware",
  appliance: "Appliance",
  fixture: "Fixture",
  furniture: "Furniture",
  system: "System",
  other: "Other",
};

export function nextDueDate(
  recurrence: string,
  intervalDays: number | null | undefined,
  from: number = now()
): number | null {
  const day = 86400;
  switch (recurrence) {
    case "daily":
      return from + day;
    case "weekly":
      return from + 7 * day;
    case "monthly":
      return from + 30 * day;
    case "quarterly":
      return from + 90 * day;
    case "yearly":
      return from + 365 * day;
    case "custom":
      return intervalDays ? from + intervalDays * day : null;
    default:
      return null;
  }
}
