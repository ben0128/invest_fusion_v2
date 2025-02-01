import { Context } from 'hono';
import { PriceData, RawPriceData, PriceApiError } from 'shared/types';


export class PriceApiService {
	constructor(
		private readonly apiUrl: string,
		private readonly apiKey: string,
		private readonly cacheTTL: number,
		private readonly maxBatchSize: number,
		private readonly cache: Cache,
		private readonly ErrorClass: typeof PriceApiError,
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
				const cachedData: PriceData = await cachedResponse.json();
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
			const data: RawPriceData = await response.json();

			if (data.price === null) {
				throw new this.ErrorClass(`Price not found for symbol: ${symbol}`, 404, symbol);
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
			if (error instanceof this.ErrorClass) throw error;
			throw new this.ErrorClass(`Failed to fetch price for ${symbol}`, 500, symbol);
		}
	}

	async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
		const startTime: number = Date.now();
		const results: PriceData[] = [];
		const missedSymbols: string[] = [];

		// 先檢查快取
		for (const symbol of symbols) {
			const cacheKey = this.getCacheKey(symbol);
			const cachedResponse = await this.cache.match(new Request(cacheKey));

			if (cachedResponse) {
				const cachedData: PriceData = await cachedResponse.json();
				results.push(cachedData);
			} else {
				missedSymbols.push(symbol);
			}
		}
		console.debug('missedSymbols', missedSymbols);

		// 如果所有標的都命中快取，直接返回結果
		if (missedSymbols.length === 0) {
			return results;
		}

		// 如果有未命中快取的標的，進行批次 API 請求將標的分組，每組不超過 maxBatchSize
		for (let i = 0; i < missedSymbols.length; i += this.maxBatchSize) {
			const batch = missedSymbols.slice(i, i + this.maxBatchSize);
			const symbolsParam = batch.join(',');

			try {
				const response = await fetch(
					`${this.apiUrl}/price?symbol=${symbolsParam}&apikey=${this.apiKey}`,
				);
				const data: { [key: string]: RawPriceData } = await response.json();

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
					const cacheKey: string = this.getCacheKey(symbol);
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
				if (error instanceof this.ErrorClass) throw error;
				throw new this.ErrorClass(`Failed to fetch batch prices for ${symbolsParam}`, 500, symbolsParam);
			}
		}

		const endTime: number = Date.now();
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
		const cache: Cache = caches.default;
		const priceApi = new PriceApiService(
			c.env.TWELVE_DATA_API_URL,
			c.env.TWELVE_DATA_API_KEY,
			c.env.CACHE_TTL,
			c.env.MAX_BATCH_SIZE,
			cache,
			PriceApiError,
		);

		const data: PriceData = await priceApi.getPrice(symbol);
		return c.json(data);
	} catch (error) {
		return errorHandler(c, error);
	}
}

export async function handleGetBatchPrices(c: Context) {
	const payload = await c.req.json();

	if (!Array.isArray(payload.symbols)) {
		return c.json({ error: 'Request body must contain a symbols array' }, 400);
	}

	const symbols: string[] = payload.symbols.map((s: string) => s.trim()).filter(Boolean);

	if (symbols.length === 0) {
		return c.json({ error: 'At least one symbol is required' }, 400);
	}

	try {
		const cache: Cache = caches.default;
		const priceApi = new PriceApiService(
			c.env.TWELVE_DATA_API_URL,
			c.env.TWELVE_DATA_API_KEY,
			c.env.CACHE_TTL,
			c.env.MAX_BATCH_SIZE,
			cache,
			PriceApiError,
		);

		const data: PriceData[] = await priceApi.getBatchPrices(symbols);
		return c.json(data);
	} catch (error) {
		return errorHandler(c, error);
	}
}

// 統一的錯誤處理
async function errorHandler(c: Context, error: unknown) {
	if (error instanceof PriceApiError) {
		return c.json({ error: error.message, symbol: error.symbol }, error.statusCode);
	}
	return c.json({ error: 'Internal Server Error' }, 500);
}