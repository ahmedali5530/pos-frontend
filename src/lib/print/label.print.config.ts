export const LABEL_PRINT_SETTING_NAME = 'Label Print';

export type LabelCodeMode = 'barcode' | 'qrcode' | 'both';
export type LabelBarcodeType = 'CODE128' | 'EAN13';
export type LabelFontSize = 'small' | 'medium';

export interface LabelPrintConfig {
  codeMode: LabelCodeMode;
  barcodeType: LabelBarcodeType;
  showCodeHumanReadable: boolean;
  showName: boolean;
  showBarcodeText: boolean;
  showPrice: boolean;
  showSku: boolean;
  showCategory: boolean;
  showCompanyName: boolean;
  companyName: string;
  labelWidthMm: number;
  labelHeightMm: number;
  dpi: number;
  marginMm: number;
  fontSize: LabelFontSize;
  currencySymbol?: string;
}

export const DEFAULT_LABEL_PRINT_CONFIG: LabelPrintConfig = {
  codeMode: 'barcode',
  barcodeType: 'CODE128',
  showCodeHumanReadable: true,
  showName: true,
  showBarcodeText: false,
  showPrice: true,
  showSku: false,
  showCategory: false,
  showCompanyName: false,
  companyName: '',
  labelWidthMm: 50,
  labelHeightMm: 30,
  dpi: 203,
  marginMm: 2,
  fontSize: 'medium',
};

export function normalizeLabelPrintConfig(values?: Partial<LabelPrintConfig> | null): LabelPrintConfig {
  return {
    ...DEFAULT_LABEL_PRINT_CONFIG,
    ...(values || {}),
    codeMode: values?.codeMode || DEFAULT_LABEL_PRINT_CONFIG.codeMode,
    barcodeType: values?.barcodeType || DEFAULT_LABEL_PRINT_CONFIG.barcodeType,
    fontSize: values?.fontSize || DEFAULT_LABEL_PRINT_CONFIG.fontSize,
    labelWidthMm: Number(values?.labelWidthMm) || DEFAULT_LABEL_PRINT_CONFIG.labelWidthMm,
    labelHeightMm: Number(values?.labelHeightMm) || DEFAULT_LABEL_PRINT_CONFIG.labelHeightMm,
    dpi: Number(values?.dpi) || DEFAULT_LABEL_PRINT_CONFIG.dpi,
    marginMm: Number(values?.marginMm) || DEFAULT_LABEL_PRINT_CONFIG.marginMm,
  };
}
