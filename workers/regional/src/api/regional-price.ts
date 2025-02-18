// import { Hono } from 'hono';

// import { zValidator } from '@hono/zod-validator';
// import { Env } from '../types';
// import { createLogger } from 'shared/utils/logger';
// import { symbolSchema, batchSymbolsSchema } from 'shared/schemas/price.schema';
// import { SinglePriceResponse, BatchPriceResponse } from 'shared/types/api';
// import { AppError } from 'shared/errors/AppError';
// import { PriceData } from '@shared/types';
// import { Edge_Cache_Config } from '@shared/constants';

// const logger = createLogger('PriceAPI');
// const price = new Hono<{ Bindings: Env }>();
// const cache = caches.default;

// // GET /prices/:symbol - 獲取單一股票價格
// price.get('/:symbol', zValidator('param', symbolSchema), async (c) => {
// 	try {
// 		console.log('c.env.PRICE_SERVICE', c.env.PRICE_SERVICE);
// 		const startTime = Date.now();
// 		const { symbol } = c.req.valid('param');

// 		const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
// 		const cachedResponse = await cache.match(cacheKey);
// 		if (cachedResponse && cachedResponse.status === 200) {
// 			const cachedData: PriceData = await cachedResponse.json();
// 			const endTime = Date.now();
// 			logger.info(`Cache hit for ${symbol}: ${cachedData.price}, ${endTime - startTime}ms`);
// 			return c.json({
// 				success: true,
// 				data: cachedData,
// 			});
// 		}

// 		const result: PriceData = await c.env.PRICE_SERVICE.getSinglePrice(symbol);

// 		// 存入快取
// 		await cache.put(
// 			cacheKey,
// 			new Response(JSON.stringify(result), {
// 				headers: Edge_Cache_Config.getHeaders(parseInt(c.env.CACHE_TTL)),
// 			}),
// 		);

// 		const response: SinglePriceResponse = {
// 			success: true,
// 			data: result,
// 		};
// 		const endTime = Date.now();
// 		logger.info(`${symbol}: ${result.price}, Time taken: ${endTime - startTime}ms`);

// 		return c.json(response);
// 	} catch (error) {
// 		logger.error('獲取單一股票價格失敗:', error);
// 		throw AppError.priceFetchFailed();
// 	}
// });

// // POST /prices/batch - 批量獲取股票價格
// price.post('/batch', zValidator('json', batchSymbolsSchema), async (c) => {
// 	const startTime = Date.now();
// 	const { symbols } = c.req.valid('json');
// 	logger.info('批量請求股票:', symbols);

// 	try {
// 		// 先檢查快取中是否有資料
// 		const cacheChecks = await Promise.all(
// 			symbols.map(async (symbol) => {
// 				const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
// 				const cachedResponse = await cache.match(cacheKey);
// 				if (cachedResponse && cachedResponse.status === 200) {
// 					return { symbol, data: await cachedResponse.json(), fromCache: true };
// 				}
// 				return { symbol, fromCache: false };
// 			}),
// 		);

// 		// 分離快取命中和未命中的結果
// 		const cachedResults: PriceData[] = [];
// 		const missedSymbols: string[] = [];

// 		cacheChecks.forEach((result) => {
// 			if (result.fromCache) {
// 				cachedResults.push(result.data as PriceData);
// 			} else {
// 				missedSymbols.push(result.symbol);
// 			}
// 		});

// 		// 如果有未命中快取的標的，從 service 獲取
// 		let freshResults: PriceData[] = [];
// 		if (missedSymbols.length > 0) {
// 			freshResults = await c.env.PRICE_SERVICE.getBatchPrices(missedSymbols);

// 			// 將新獲取的資料存入快取
// 			await Promise.all(
// 				freshResults.map(async (result) => {
// 					const cacheKey = new Request(Edge_Cache_Config.getCacheKey(result.symbol));
// 					await cache.put(
// 						cacheKey,
// 						new Response(JSON.stringify(result), {
// 							headers: Edge_Cache_Config.getHeaders(parseInt(c.env.CACHE_TTL)),
// 						}),
// 					);
// 				}),
// 			);
// 		}

// 		// 合併快取和新獲取的結果
// 		const allResults = [...cachedResults, ...freshResults];

// 		const response: BatchPriceResponse = {
// 			success: true,
// 			data: allResults,
// 		};

// 		const endTime = Date.now();
// 		logger.info(
// 			`Batch request completed in ${endTime - startTime}ms for ${symbols.length} symbols`,
// 		);

// 		return c.json(response);
// 	} catch (error) {
// 		logger.error('處理批量請求失敗:', error);
// 		throw AppError.batchPriceFetchFailed();
// 	}
// });

// export default price;

import { PriceData } from '@shared/types';
import { PriceService } from '../types';
import { Edge_Cache_Config } from '@shared/constants';
const cache = caches.default;


export const priceFunctions = {
    getSinglePrice: async (priceService: PriceService, symbol: string): Promise<{success: boolean, data: PriceData[]}> => {
        try {
            if (!symbol) {
                throw new Error('Missing symbol');
            }

            // 檢查快取
            const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
            const cachedResponse = await cache.match(cacheKey);
            
            if (cachedResponse && cachedResponse.status === 200) {
                const cachedData: PriceData = await cachedResponse.json();
                return {
                    success: true,
                    data: [cachedData]
                };
            }

            // 如果快取未命中，從服務獲取數據
            const result = await priceService.getSinglePrice(symbol);
            
            // 存入快取
            await cache.put(
                cacheKey,
                new Response(JSON.stringify(result), {
                    headers: Edge_Cache_Config.getHeaders(300), // 預設 5 分鐘快取
                })
            );

            return {
                success: true,
                data: [result]
            };
        } catch (error) {
            console.error('Error fetching price:', error);
            throw new Error(error instanceof Error ? error.message : 'Price fetch failed');
        }
    },
    getBatchPrices: async (priceService: PriceService, symbols: string[]): Promise<{success: boolean, data: PriceData[]}> => {
        try {
            // 檢查快取中是否有資料
            const cacheChecks = await Promise.all(
                symbols.map(async (symbol) => {
                    const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));
                    const cachedResponse = await cache.match(cacheKey);
                    if (cachedResponse && cachedResponse.status === 200) {
                        return { symbol, data: await cachedResponse.json(), fromCache: true };
                    }
                    return { symbol, fromCache: false };
                })
            );

            // 分離快取命中和未命中的結果
            const cachedResults: PriceData[] = [];
            const missedSymbols: string[] = [];

            cacheChecks.forEach((result) => {
                if (result.fromCache) {
                    cachedResults.push(result.data as PriceData);
                } else {
                    missedSymbols.push(result.symbol);
                }
            });

            // 如果有未命中快取的標的，從 service 獲取
            if (missedSymbols.length > 0) {
                const freshResults = await priceService.getBatchPrices(missedSymbols);

                // 將新獲取的資料存入快取
                await Promise.all(
                    freshResults.map(async (result) => {
                        const cacheKey = new Request(Edge_Cache_Config.getCacheKey(result.symbol));
                        await cache.put(
                            cacheKey,
                            new Response(JSON.stringify(result), {
                                headers: Edge_Cache_Config.getHeaders(300), // 預設 5 分鐘快取
                            })
                        );
                    })
                );

                // 合併快取和新獲取的結果
                console.log('cachedResults', cachedResults);
                console.log('freshResults', freshResults);
                return {
                    success: true,
                    data: [...cachedResults, ...freshResults]
                };
            }

            return {
                success: true,
                data: cachedResults
            };
        } catch (error) {
            console.error('Error fetching batch prices:', error);
            throw new Error(error instanceof Error ? error.message : 'Batch price fetch failed');
        }
    }
}
