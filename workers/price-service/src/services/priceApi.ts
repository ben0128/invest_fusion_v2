import { Context } from 'hono';
import { PriceData, RawPriceData, PriceApiError, BatchPriceResponse, Bindings } from 'shared/types';

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

			const priceData: PriceData = {
				symbol: symbol,
				price: parseFloat(data.price.toString()),
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
		
		// 並行處理所有快取查詢
		const cacheChecks = symbols.map(async (symbol) => {
			const cacheKey = this.getCacheKey(symbol);
			const cachedResponse = await this.cache.match(new Request(cacheKey));
			if (cachedResponse) {
				const cachedData: PriceData = await cachedResponse.json();
				return { symbol, price: cachedData.price, cached: true };
			}
			return { symbol, cached: false };
		});
	
		// 等待所有快取查詢完成
		const cacheResults = await Promise.all(cacheChecks);
		// 分離快取命中和未命中的結果
		const results: PriceData[] = [];
		const missedSymbols: string[] = [];
		
		cacheResults.forEach(result => {
			if (result.cached) {
				results.push({
					symbol: result.symbol,
					price: result.price ?? 0,
					timestamp: Date.now(),
				});
			} else {
				missedSymbols.push(result.symbol);
			}
		});
		console.debug('missedSymbols', missedSymbols);

		// 如果所有標的都命中快取，直接返回結果
		if (missedSymbols.length === 0) {
			return results;
		}

		// 如果有未命中快取的標的，進行批次 API 請求將標的分組，每組不超過 maxBatchSize
		// 並行處理未命中快取的批次請求
		const batchPromises = [];
		for (let i = 0; i < missedSymbols.length; i += this.maxBatchSize) {
			const batch = missedSymbols.slice(i, i + this.maxBatchSize);
			const symbolsParam = batch.join(',');
			console.debug('symbolsParam', symbolsParam);
			const batchPromise = (async () => {
				try {
					const response = await fetch(
						`${this.apiUrl}/price?symbol=${symbolsParam}&apikey=${this.apiKey}`,
					);
					const rawData = await response.json();

					// 如果symbolsParam 是只有一個標的，data 會是 { price: number }，需要修改成 { [symbol]: { price: 240 }}
					let data: BatchPriceResponse;

					if ('price' in rawData) {
						// 單一價格回應
						data = { [symbolsParam]: { price: (rawData as RawPriceData).price } };
					} else {
						// 多重價格回應
						data = rawData as BatchPriceResponse;
					}

					console.debug('data', data);
					// 並行處理快取更新
					const updatePromises = batch.map(async (symbol) => {
						const price = data[symbol]?.price;
						if (price === undefined || price === null) {
							console.warn(`Price not found for symbol: ${symbol}`);
							return null;
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

						return priceData;
					});

					const batchResults = await Promise.all(updatePromises);
					return batchResults.filter((result): result is PriceData => result !== null);
				} catch (error) {
					if (error instanceof this.ErrorClass) throw error;
					throw new this.ErrorClass(
						`Failed to fetch batch prices for ${symbolsParam}`,
						500,
						symbolsParam
					);
				}
			})();

			batchPromises.push(batchPromise);
		}

		// 等待所有批次請求完成
		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults.flat());
		const endTime: number = Date.now();
		console.debug(
			`Batch request completed in ${endTime - startTime}ms for ${symbols.length} symbols`,
		);

		return results;
	}
}

// 統一的錯誤處理
export async function errorHandler(c: Context, error: unknown) {
	if (error instanceof PriceApiError) {
		return c.json({ error: error.message, symbol: error.symbol }, error.statusCode);
	}
	return c.json({ error: 'Internal Server Error' }, 500);
}