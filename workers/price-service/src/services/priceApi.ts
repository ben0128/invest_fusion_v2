import { Context } from 'hono';
import { PriceData } from 'shared/types';

export class PriceApiService {
	constructor(
		private readonly apiUrl: string,
		private readonly apiKey: string,
		private readonly cacheTTL: number,
		private readonly maxBatchSize: number,
		private readonly cache: Cache,
	) {}

	private getCacheKey(symbol: string): string {
		return `https://api.price-cache.local/prices/${symbol.toUpperCase()}`;
	}

	async getPrice(symbol: string): Promise<PriceData> {
		const startTime = Date.now();
		const cacheKey = this.getCacheKey(symbol);

		try {
			// 嘗試從快取中獲取數據
			const cachedResponse = await this.cache.match(new Request(cacheKey));
			if (cachedResponse) {
				const cachedData = await cachedResponse.json();
				const endTime = Date.now();
				console.debug(
					`Cache hit for ${symbol}: ${cachedData.price}, ${endTime - startTime}ms`,
				);
				return cachedData;
			}

			// 如果快取中沒有，則從 API 獲取
			const response = await fetch(
				`${this.apiUrl}/price?symbol=${symbol}&apikey=${this.apiKey}`,
			);
			const data = await response.json();
			console.debug(data);
			if (data.price === null) {
				throw new Error('Target Price not found');
			}

			// 準備要快取的數據
			const priceData: PriceData = {
				symbol: symbol,
				price: data.price,
				timestamp: Date.now(),
			};

			// 存入快取
			await this.cache.put(
				new Request(cacheKey),
				new Response(JSON.stringify(priceData), {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': `max-age=${this.cacheTTL}`,
					},
				}),
			);

			const endTime = Date.now();
			console.debug(`${symbol}: ${data.price}, Time taken: ${endTime - startTime}ms`);

			return priceData;
		} catch (error) {
			console.error('Error fetching price:', error);
			throw error;
		}
	}

	async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
		const startTime = Date.now();
		const results: PriceData[] = [];
		const missedSymbols: string[] = [];

		// 先檢查快取
		console.debug(symbols);
		console.debug(typeof symbols);
		for (const symbol of symbols) {
			const cacheKey = this.getCacheKey(symbol);
			const cachedResponse = await this.cache.match(new Request(cacheKey));

			if (cachedResponse) {
				const cachedData = await cachedResponse.json();
				results.push(cachedData);
			} else {
				missedSymbols.push(symbol);
			}
		}

		// 如果有未命中快取的標的，進行批次 API 請求
		if (missedSymbols.length > 0) {
			// 將標的分組，每組不超過 maxBatchSize
			for (let i = 0; i < missedSymbols.length; i += this.maxBatchSize) {
				const batch = missedSymbols.slice(i, i + this.maxBatchSize);
				const symbolsParam = batch.join(',');

				try {
					const response = await fetch(
						`${this.apiUrl}/price?symbol=${symbolsParam}&apikey=${this.apiKey}`,
					);
					const data = await response.json();

					// 處理每個標的的回應
					for (const symbol of batch) {
						const price = data[symbol]?.price;
						if (price === undefined || price === null) {
							console.warn(`Price not found for symbol: ${symbol}`);
							continue;
						}

						const priceData: PriceData = {
							symbol: symbol,
							price: price,
							timestamp: Date.now(),
						};

						// 更新快取
						const cacheKey = this.getCacheKey(symbol);
						await this.cache.put(
							new Request(cacheKey),
							new Response(JSON.stringify(priceData), {
								headers: {
									'Content-Type': 'application/json',
									'Cache-Control': `max-age=${this.cacheTTL}`,
								},
							}),
						);

						results.push(priceData);
					}
				} catch (error) {
					console.error(
						`Error fetching batch prices for symbols: ${symbolsParam}`,
						error,
					);
					throw error;
				}
			}
		}

		const endTime = Date.now();
		console.debug(
			`Batch request completed in ${endTime - startTime}ms for ${symbols.length} symbols`,
		);

		return results;
	}
}

export async function handleGetSinglePrice(c: Context) {
	const symbol = c.req.query('symbol');

	if (!symbol) {
		return c.json({ error: 'Symbol is required' }, 400);
	}

	try {
		// 使用 caches.default 獲取預設的快取實例
		const cache = caches.default;
		const priceApi = new PriceApiService(
			c.env.TWELVE_DATA_API_URL,
			c.env.TWELVE_DATA_API_KEY,
			c.env.CACHE_TTL,
			c.env.MAX_BATCH_SIZE,
			cache,
		);

		const data = await priceApi.getPrice(symbol);
		return c.json(data);
	} catch (error) {
		if (error instanceof Error) {
			return c.json({ error: error.message }, 400);
		}
		return c.json({ error: 'Failed to fetch price' }, 500);
	}
}

export async function handleGetBatchPrices(c: Context) {
	const payload = await c.req.json();

	if (!Array.isArray(payload.symbols)) {
		return c.json({ error: 'Request body must contain a symbols array' }, 400);
	}

	const symbols = payload.symbols.map((s: string) => s.trim()).filter(Boolean);

	if (symbols.length === 0) {
		return c.json({ error: 'At least one symbol is required' }, 400);
	}

	if (symbols.length > 50) {
		return c.json({ error: 'Maximum 50 symbols allowed per request' }, 400);
	}

	try {
		const cache = caches.default;
		const priceApi = new PriceApiService(
			c.env.TWELVE_DATA_API_KEY,
			c.env.TWELVE_DATA_API_URL,
			c.env.CACHE_TTL,
			c.env.MAX_BATCH_SIZE,
			cache,
		);

		const data = await priceApi.getBatchPrices(symbols);
		return c.json(data);
	} catch (error) {
		if (error instanceof Error) {
			return c.json({ error: error.message }, 400);
		}
		return c.json({ error: 'Failed to fetch batch prices' }, 500);
	}
}
