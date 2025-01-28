export enum AssetType {
  CRYPTO = 'crypto',
  BINANCE = 'binance',
  US_STOCK = 'us_stock',
  TW_STOCK = 'tw_stock'
}

export interface Asset {
  id: string;
  type: AssetType;
  symbol: string;
  amount: number;
  value?: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
} 