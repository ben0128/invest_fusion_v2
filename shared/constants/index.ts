export const PRICE_UPDATE_INTERVAL = 5000; // 5 seconds

export const API_ENDPOINTS = {
	TWELVE_DATA: 'https://api.twelvedata.com',
	BINANCE: 'https://api.binance.com',
} as const;

export const CACHE_KEYS = {
	PRICES: 'prices',
	ASSETS: 'assets',
} as const;

export const Edge_Cache_Config = {
    NAMESPACE: 'prices',
    KEY_PREFIX: 'https://api.invest-fusion.com/prices',
    TTL: 10,
    getCacheKey: (symbol: string) => `${Edge_Cache_Config.KEY_PREFIX}/${symbol.toUpperCase()}`,
    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${Edge_Cache_Config.TTL}`,
    })
};