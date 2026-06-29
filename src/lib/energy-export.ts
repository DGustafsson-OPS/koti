import type { KotiakkuMeasurement } from "@/lib/kotiakku";
import { toCsv } from "@/lib/csv";

const HEADERS = [
  "period_start",
  "period_end",
  "state_of_charge_percent",
  "house_power_kw",
  "solar_power_kw",
  "grid_power_kw",
  "battery_power_kw",
  "solar_to_house_kw",
  "solar_to_battery_kw",
  "solar_to_grid_kw",
  "grid_to_house_kw",
  "grid_to_battery_kw",
  "battery_to_house_kw",
  "battery_to_grid_kw",
  "battery_loss_kw",
  "spot_price_cents_per_kwh",
  "battery_temperature_celsius",
];

function cell(value: number | string | null | undefined) {
  if (value == null) return "";
  return String(value);
}

export function exportEnergyCsv(measurements: KotiakkuMeasurement[]) {
  const rows = measurements.map((row) => [
    row.periodStart,
    row.periodEnd,
    cell(row.stateOfChargePercent),
    cell(row.housePowerKw),
    cell(row.solarPowerKw),
    cell(row.gridPowerKw),
    cell(row.batteryPowerKw),
    cell(row.solarToHouseKw),
    cell(row.solarToBatteryKw),
    cell(row.solarToGridKw),
    cell(row.gridToHouseKw),
    cell(row.gridToBatteryKw),
    cell(row.batteryToHouseKw),
    cell(row.batteryToGridKw),
    cell(row.batteryLossKw),
    cell(row.spotPriceCentsPerKwh),
    cell(row.batteryTemperatureCelsius),
  ]);

  return toCsv(HEADERS, rows);
}
