export const PRICE_UPDATE_INTERVAL = 5000; // 5 seconds

export const API_ENDPOINTS = {
	TWELVE_DATA: 'https://api.twelvedata.com',
	BINANCE: 'https://api.binance.com',
} as const;

export const CACHE_KEYS = {
	PRICES: 'prices',
	ASSETS: 'assets',
} as const;
