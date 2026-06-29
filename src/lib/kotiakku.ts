const KOTIAKKU_API_URL = "https://residential.gridle.com/api/public/measurements";

export type KotiakkuMeasurement = {
  periodStart: string;
  periodEnd: string;
  batteryPowerKw: number | null;
  stateOfChargePercent: number | null;
  solarPowerKw: number | null;
  gridPowerKw: number | null;
  housePowerKw: number | null;
  solarToHouseKw: number | null;
  solarToBatteryKw: number | null;
  solarToGridKw: number | null;
  gridToHouseKw: number | null;
  gridToBatteryKw: number | null;
  batteryToHouseKw: number | null;
  batteryToGridKw: number | null;
  spotPriceCentsPerKwh: number | null;
  batteryTemperatureCelsius: number | null;
};

export class KotiakkuApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "KotiakkuApiError";
  }
}

function parseMeasurement(raw: Record<string, unknown>): KotiakkuMeasurement {
  const num = (key: string) => {
    const value = raw[key];
    return typeof value === "number" ? value : null;
  };

  return {
    periodStart: String(raw.period_start ?? ""),
    periodEnd: String(raw.period_end ?? ""),
    batteryPowerKw: num("battery_power_kw"),
    stateOfChargePercent: num("state_of_charge_percent"),
    solarPowerKw: num("solar_power_kw"),
    gridPowerKw: num("grid_power_kw"),
    housePowerKw: num("house_power_kw"),
    solarToHouseKw: num("solar_to_house_kw"),
    solarToBatteryKw: num("solar_to_battery_kw"),
    solarToGridKw: num("solar_to_grid_kw"),
    gridToHouseKw: num("grid_to_house_kw"),
    gridToBatteryKw: num("grid_to_battery_kw"),
    batteryToHouseKw: num("battery_to_house_kw"),
    batteryToGridKw: num("battery_to_grid_kw"),
    spotPriceCentsPerKwh: num("spot_price_cents_per_kwh"),
    batteryTemperatureCelsius: num("battery_temperature_celsius"),
  };
}

async function fetchMeasurements(
  apiKey: string,
  params?: { startTime?: string; endTime?: string }
): Promise<KotiakkuMeasurement[]> {
  const url = new URL(KOTIAKKU_API_URL);
  if (params?.startTime) url.searchParams.set("start_time", params.startTime);
  if (params?.endTime) url.searchParams.set("end_time", params.endTime);

  const response = await fetch(url, {
    headers: { "x-api-key": apiKey },
    next: { revalidate: 300 },
  });

  if (response.status === 401 || response.status === 403) {
    throw new KotiakkuApiError("Invalid API key", response.status);
  }
  if (response.status === 429) {
    throw new KotiakkuApiError("Rate limit exceeded", response.status);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new KotiakkuApiError(body || `API error (${response.status})`, response.status);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new KotiakkuApiError("Unexpected API response");
  }

  return payload.map((item) => parseMeasurement(item as Record<string, unknown>));
}

export async function validateKotiakkuApiKey(apiKey: string): Promise<boolean> {
  await fetchMeasurements(apiKey);
  return true;
}

export async function getKotiakkuLatest(apiKey: string): Promise<KotiakkuMeasurement | null> {
  const data = await fetchMeasurements(apiKey);
  return data.at(-1) ?? null;
}

export async function getKotiakkuRange(
  apiKey: string,
  startTime: string,
  endTime?: string
): Promise<KotiakkuMeasurement[]> {
  return fetchMeasurements(apiKey, { startTime, endTime });
}

export function formatPowerKw(value: number | null | undefined, locale: string): string {
  if (value == null) return "—";
  return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })} kW`;
}

export function formatPercent(value: number | null | undefined, locale: string): string {
  if (value == null) return "—";
  return `${value.toLocaleString(locale, { maximumFractionDigits: 0 })}%`;
}

export function formatSpotPrice(value: number | null | undefined, locale: string): string {
  if (value == null) return "—";
  return `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/kWh`;
}

export function propertyHasKotiakku(property: { kotiakkuApiKeyEnc?: string | null }) {
  return Boolean(property.kotiakkuApiKeyEnc);
}
