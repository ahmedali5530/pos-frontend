export interface ProductPrice {
  id: number;
  date?: string;
  time?: string;
  timeTo?: string;
  day?: string;
  week?: number;
  month?: number;
  quarter?: number;
  rate?: number;
  minQuantity?: number;
  maxQuantity?: number;
  basePrice?: number;
  baseQuantity?: number;
}