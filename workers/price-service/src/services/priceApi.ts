import { PriceData, RawPriceData, BatchPriceResponse } from 'shared/types';
import { Edge_Cache_Config, API_ROUTES } from 'shared/constants';
import { Logger } from '@shared/utils/logger';
import { AppError } from 'shared/errors/AppError';

export class PriceApiService {
	// private priceStore: DurableObjectStorage;
	// private subscribers: Set<string> = new Set(); // 儲存訂閱的 Regional DO ID

	constructor(
		private readonly apiUrl: string,
		private readonly apiKey: string,
		private readonly cacheTTL: number,
		private readonly maxBatchSize: number,
		private readonly cache: Cache,
		private readonly logger: Logger,
		// private readonly ErrorClass: typeof PriceApiError,
		// storage: DurableObjectStorage,
	) {
		// this.priceStore = storage;
	}

	// 新增訂閱管理方法
	// async addSubscriber(regionalDoId: string) {
	// 	this.subscribers.add(regionalDoId);
	// 	// 將訂閱者資訊持久化儲存
	// 	await this.priceStore.put('subscribers', Array.from(this.subscribers));
	// }

	// async removeSubscriber(regionalDoId: string) {
	// 	this.subscribers.delete(regionalDoId);
	// 	await this.priceStore.put('subscribers', Array.from(this.subscribers));
	// }

	// 修改現有的價格更新邏輯，加入推送機制
	// private async notifyPriceChange(priceData: PriceData) {
	// 	// 取得所有訂閱者
	// 	const subscribers = await this.priceStore.get('subscribers') as string[];

	// 	// 向所有訂閱的 Regional DO 推送更新
	// 	const notifications = subscribers.map(async (regionalDoId) => {
	// 		const regionalDoStub = await this.env.REGIONAL_DO.get(
	// 			this.env.REGIONAL_DO.idFromString(regionalDoId)
	// 		);

	// 		await regionalDoStub.fetch('http://internal/price-update', {
	// 			method: 'POST',
	// 			body: JSON.stringify(priceData)
	// 		});
	// 	});

	// 	await Promise.all(notifications);
	// }

	async getPrice(symbol: string): Promise<PriceData> {
		const startTime = Date.now();
		const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
		const cache: Cache = this.cache;

		// 加入更詳細的除錯日誌
		// this.logger.info('Checking cache for symbol:', symbol);
		// this.logger.info('Cache key:', Edge_Cache_Config.getCacheKey(symbol));

		const cachedResponse = await cache.match(cacheKey);
		// this.logger.info('Cached response exists:', !!cachedResponse);

		if (cachedResponse && cachedResponse.status === 200) {
			const cachedData: PriceData = await cachedResponse.json();
			const endTime = Date.now();
			this.logger.info(
				`Cache hit for ${symbol}: ${cachedData.price}, ${endTime - startTime}ms`,
			);
			return cachedData;
		}
		// 如果快取中沒有，則從 API 獲取
		const response = await fetch(API_ROUTES.getPriceUrl(this.apiUrl, symbol, this.apiKey));
		const rawData: RawPriceData = await response.json();
		this.logger.info('rawData', rawData);
		if (!rawData || rawData.code || rawData.price === null) {
			if (rawData?.code === 429) {
				throw AppError.rateLimitExceeded();
			} else if (rawData?.code === 404) {
				throw AppError.symbolNotFound();
			} else {
				throw AppError.externalApiError();
			}
		}

		const priceData: PriceData = {
			symbol: symbol,
			price: Number(rawData.price) ?? 0,
			timestamp: Date.now(),
		};

		// 存入快取
		await this.cache.put(
			cacheKey,
			new Response(JSON.stringify(priceData), {
				headers: Edge_Cache_Config.getHeaders(this.cacheTTL),
			}),
		);

		this.logger.info(`${symbol}: ${rawData.price}, Time taken: ${Date.now() - startTime}ms`);

		return priceData;
	}

	// 批量獲取價格, 一次傳入多個標的時, 會先檢查快取, 如果快取中沒有, 則會進行批次 API 請求將標的分組，每組不超過 maxBatchSize
	async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
		const startTime: number = Date.now();

		// 並行處理所有快取查詢
		const cacheChecks = symbols.map(async (symbol) => {
			const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
			const cachedResponse = await this.cache.match(cacheKey);
			if (cachedResponse && cachedResponse.status === 200) {
				const cachedData: PriceData = await cachedResponse.json();
				return { symbol, price: cachedData.price, cached: true };
			}
			return { symbol, cached: false };
		});

		// 等待所有快取查詢完成cacheKey
		const cacheResults = await Promise.all(cacheChecks);
		// 分離快取命中和未命中的結果
		const results: PriceData[] = [];
		const missedSymbols: string[] = [];

		cacheResults.forEach((result) => {
			if (result.cached) {
				results.push(<PriceData>{
					symbol: result.symbol,
					price: Number(result.price) ?? 0,
					timestamp: Date.now(),
				});
			} else {
				missedSymbols.push(result.symbol);
			}
		});
		this.logger.info('missedSymbols', missedSymbols);

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
			this.logger.info('symbolsParam', symbolsParam);
			const batchPromise = (async () => {
				try {
					const response = await fetch(
						API_ROUTES.getPriceUrl(this.apiUrl, symbolsParam, this.apiKey),
					);
					const rawData: RawPriceData = await response.json();

					// 如果symbolsParam 是只有一個標的，rawData 會是 { price: number }，需要修改成 { [symbol]: { price: 240 }}
					let data: BatchPriceResponse;

					this.logger.info('rawData', rawData);
					if ('price' in rawData) {
						// 單一價格回應
						data = { [symbolsParam]: { price: (rawData as RawPriceData).price } };
					} else {
						// 多重價格回應
						data = rawData as BatchPriceResponse;
					}
					// 並行處理快取更新
					const updatePromises = batch.map(async (symbol) => {
						const price = data[symbol]?.price;
						if (price === undefined || price === null) {
							this.logger.warn(`Price not found for symbol: ${symbol}`);
							return null;
						}

						const priceData: PriceData = {
							symbol: symbol,
							price: Number(price) ?? 0,
							timestamp: Date.now(),
						};

						// 更新快取
						const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
						await this.cache.put(
							cacheKey,
							new Response(JSON.stringify(priceData), {
								headers: Edge_Cache_Config.getHeaders(this.cacheTTL),
							}),
						);

						return priceData;
					});

					const batchResults = await Promise.all(updatePromises);
					return batchResults.filter((result): result is PriceData => result !== null);
				} catch (error) {
					throw AppError.batchPriceFetchFailed();
				}
			})();

			batchPromises.push(batchPromise);
		}

		// 等待所有批次請求完成
		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults.flat());
		this.logger.info('results', results);
		const endTime: number = Date.now();
		this.logger.info(
			`Batch request completed in ${endTime - startTime}ms for ${symbols.length} symbols`,
		);

		return results;
	}
}
