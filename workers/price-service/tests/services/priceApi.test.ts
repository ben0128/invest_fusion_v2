import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PriceApiService } from '../../src/services/priceApi';
import { mockCache, mockFetch } from '../setup';
import { mockPriceData, mockErrorResponses } from '../mocks/testData';
import { createLogger } from '@shared/utils/logger';
// import { Edge_Cache_Config } from '@shared/constants';
import { AppError } from '@shared/errors/AppError';
// import { BatchPriceResponse } from '@shared/types';

describe('PriceApiService', () => {
	let priceApiService: PriceApiService;
	const logger = createLogger('PriceApiService');
	const TEST_SYMBOL = 'AAPL';
	const API_URL = 'https://api.example.com';
	const API_KEY = 'test-api-key';

	beforeEach(() => {
		priceApiService = new PriceApiService(API_URL, API_KEY, 300, 5, mockCache as any, logger);
		vi.clearAllMocks();
	});

	describe('getPrice', () => {
		it('應該從快取中返回價格資料', async () => {
            const cachedData = mockPriceData.singleSymbol.processed;
            
            mockCache.match.mockResolvedValueOnce(
                new Response(JSON.stringify(cachedData), { 
                    status: 200,
                    headers: new Headers({ 'Content-Type': 'application/json' })
                })
            );
            const result = await priceApiService.getPrice(TEST_SYMBOL);

            // // 方法1：印出所有呼叫記錄
            // console.log('All calls:', mockCache.match.mock.calls);
            
            // // 方法2：印出第一次呼叫的參數
            // console.log('First call argument:', mockCache.match.mock.calls[0]?.[0]);
            
            // // 方法3：印出所有呼叫的參數
            // console.log('All call arguments:', mockCache.match.mock.calls.map(call => call[0]));
            
            // // 方法4：印出呼叫次數
            // console.log('Number of calls:', mockCache.match.mock.calls.length);
            const actualRequest = mockCache.match.mock.calls[0][0] as Request;
            expect(actualRequest).toMatchObject({
                method: 'GET',
                url: 'https://api.invest-fusion.com/prices/AAPL'
            });
            expect(mockCache.match).toHaveBeenCalledTimes(1);
            
            expect(result).toEqual(cachedData);
            expect(mockFetch).not.toHaveBeenCalled();
        });

		it('快取未命中時應該從 API 獲取價格', async () => {
			mockCache.match.mockResolvedValueOnce(null);
			mockFetch.mockResolvedValueOnce(
				new Response(JSON.stringify(mockPriceData.singleSymbol.raw)),
			);

			const result = await priceApiService.getPrice(TEST_SYMBOL);

			expect(mockFetch).toHaveBeenCalled();
			expect(result).toEqual({
				symbol: TEST_SYMBOL,
				price: Number(mockPriceData.singleSymbol.raw.price),
				timestamp: expect.any(Number),
			});
			expect(mockCache.put).toHaveBeenCalled();
		});

		it('應該處理 API 回應 429 錯誤', async () => {
			mockCache.match.mockResolvedValueOnce(null);
			mockFetch.mockResolvedValueOnce(
				new Response(JSON.stringify(mockErrorResponses.rateLimitExceeded)),
			);

			await expect(priceApiService.getPrice(TEST_SYMBOL)).rejects.toThrow(
				AppError.rateLimitExceeded(),
			);
		});

		it('應該處理 API 回應 404 錯誤', async () => {
			mockCache.match.mockResolvedValueOnce(null);
			mockFetch.mockResolvedValueOnce(
				new Response(JSON.stringify(mockErrorResponses.symbolNotFound)),
			);

			await expect(priceApiService.getPrice(TEST_SYMBOL)).rejects.toThrow(
				AppError.symbolNotFound(),
			);
		});
	});

	describe('getBatchPrices', () => {
		const TEST_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT'];

		it('應該從快取中返回所有價格資料', async () => {
			TEST_SYMBOLS.forEach((symbol) =>
				mockCache.match.mockResolvedValueOnce(
					new Response(
						JSON.stringify({
							symbol,
							price: Number(mockPriceData.batchSymbols.raw[symbol as keyof typeof mockPriceData.batchSymbols.raw].price),
							timestamp: Date.now(),
						}),
						{ status: 200 },
					),
				),
			);

			const results = await priceApiService.getBatchPrices(TEST_SYMBOLS);

			expect(results).toHaveLength(TEST_SYMBOLS.length);
			expect(mockFetch).not.toHaveBeenCalled();
			results.forEach((result, index) => {
				expect(result.symbol).toBe(TEST_SYMBOLS[index]);
				expect(result.price).toBeGreaterThan(0);
			});
		});

		it('應該處理部分快取命中的情況', async () => {
			// AAPL 在快取中，其他不在
			mockCache.match.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						symbol: 'AAPL',
						price: 150.25,
						timestamp: Date.now(),
					}),
					{ status: 200 },
				),
			);
			mockCache.match.mockResolvedValueOnce(null); // GOOGL 快取未命中
			mockCache.match.mockResolvedValueOnce(null); // MSFT 快取未命中

			// API 回應剩餘的股票
			mockFetch.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						GOOGL: { price: '2750.50' },
						MSFT: { price: '310.75' },
					}),
				),
			);

			const results = await priceApiService.getBatchPrices(TEST_SYMBOLS);

			expect(results).toHaveLength(TEST_SYMBOLS.length);
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockCache.put).toHaveBeenCalledTimes(2); // 只有兩個新的價格需要快取
		});

		// it('應該處理批次大小限制', async () => {
		// 	const largeSymbolList = Array(7)
		// 		.fill(0)
		// 		.map((_, i) => `SYMBOL${i}`);
		// 	largeSymbolList.forEach(() => mockCache.match.mockResolvedValueOnce(null));

		// 	// 模擬兩次 API 呼叫的回應
		// 	const mockResponses = largeSymbolList.reduce<Record<string, { price: string }>>((acc, symbol) => {
		// 		acc[symbol] = { price: '100.00' };
		// 		return acc;
		// 	}, {});

		// 	mockFetch.mockResolvedValue(new Response(JSON.stringify(mockResponses)));

		// 	const results = await priceApiService.getBatchPrices(largeSymbolList);

		// 	expect(results).toHaveLength(largeSymbolList.length);
		// 	expect(mockFetch).toHaveBeenCalledTimes(2); // 應該分成兩批請求
		// });

		it('應該處理批次請求錯誤', async () => {
			TEST_SYMBOLS.forEach(() => mockCache.match.mockResolvedValueOnce(null));
			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			await expect(priceApiService.getBatchPrices(TEST_SYMBOLS)).rejects.toThrow(
				AppError.batchPriceFetchFailed(),
			);
		});
	});
});
