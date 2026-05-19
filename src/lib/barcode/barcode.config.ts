import {Setting} from "../../api/model/setting";

export interface BarcodeConfig {
  enabled: boolean;
  prefix: string;
}

export const DEFAULT_BARCODE_CONFIG: BarcodeConfig = {
  enabled: true,
  prefix: "20",
};

export const BARCODE_CONFIG_SETTING_NAME = "barcode_config";

export function getBarcodeConfigFromSettings(settings: Setting[]): BarcodeConfig {
  const row = settings.find((s) => s.name === BARCODE_CONFIG_SETTING_NAME);
  if (!row?.values) {
    return DEFAULT_BARCODE_CONFIG;
  }

  const values = row.values as Partial<BarcodeConfig>;
  return {
    enabled: values.enabled ?? DEFAULT_BARCODE_CONFIG.enabled,
    prefix: String(values.prefix ?? DEFAULT_BARCODE_CONFIG.prefix).padStart(2, "0"),
  };
}

export function isDynamicEan13Scan(barcode: string, config: BarcodeConfig): boolean {
  if (barcode.length < 12) {
    return false;
  }

  const prefix = config.prefix.padStart(2, "0");
  return barcode.substring(0, 2) === prefix;
}

export function parseDynamicEan13(barcode: string): { itemId: string; qty: number } {
  const itemId = barcode.substring(2, 7);
  const qty = Number(barcode.substring(7, 12).padStart(5, "0")) / 1000;
  console.log(itemId, qty)
  return {itemId, qty};
}
