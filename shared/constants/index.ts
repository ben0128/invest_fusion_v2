export const API_ROUTES = {
	getPriceUrl: (baseUrl: string, symbol: string, apiKey: string) => 
		`${baseUrl}/price?symbol=${symbol}&apikey=${apiKey}`,
} as const;

export const Edge_Cache_Config = {
    KEY_PREFIX: 'https://api.invest-fusion.com/prices',
    TTL: 10,
    getCacheKey: (symbol: string) => `${Edge_Cache_Config.KEY_PREFIX}/${symbol.toUpperCase()}`,
    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${Edge_Cache_Config.TTL}`,
    })
};