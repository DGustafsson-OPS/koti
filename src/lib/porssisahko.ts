const LATEST_PRICES_URL = "https://api.porssisahko.net/v2/latest-prices.json";

export type SpotPriceSlot = {
  priceCentsPerKwh: number;
  startDate: string;
  endDate: string;
};

export async function getLatestSpotPrices(): Promise<SpotPriceSlot[]> {
  const response = await fetch(LATEST_PRICES_URL, { next: { revalidate: 900 } });
  if (!response.ok) {
    throw new Error(`Porssisahko API error (${response.status})`);
  }

  const payload = (await response.json()) as {
    prices?: { price: number; startDate: string; endDate: string }[];
  };

  if (!Array.isArray(payload.prices)) return [];

  return payload.prices.map((slot) => ({
    priceCentsPerKwh: slot.price,
    startDate: slot.startDate,
    endDate: slot.endDate,
  }));
}

/** Find spot price (c/kWh incl. VAT) for a timestamp. */
export function spotPriceAt(slots: SpotPriceSlot[], isoTime: string): number | null {
  const time = Date.parse(isoTime);
  if (Number.isNaN(time)) return null;

  for (const slot of slots) {
    const start = Date.parse(slot.startDate);
    const end = Date.parse(slot.endDate);
    if (!Number.isNaN(start) && !Number.isNaN(end) && time >= start && time <= end) {
      return slot.priceCentsPerKwh;
    }
  }

  return null;
}

export function currentSpotPrice(slots: SpotPriceSlot[]): SpotPriceSlot | null {
  const now = Date.now();
  for (const slot of slots) {
    const start = Date.parse(slot.startDate);
    const end = Date.parse(slot.endDate);
    if (!Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end) {
      return slot;
    }
  }
  return slots[0] ?? null;
}
