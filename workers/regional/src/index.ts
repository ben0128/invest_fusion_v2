// import { Hono } from 'hono';
// import { cors } from 'hono/cors';
// import { AppType } from '../../price-service/src/index'
// import { hc } from 'hono/client'
// import { ServiceBindings } from 'shared/types';

// import { Edge_Cache_Config } from 'shared/constants';


// const app = new Hono();
// app.use('/*', cors());
// // // 啟用 CORS
// type PriceServiceClient = {
//     (args: { query: { symbol: string } }): Promise<Response>;
//     posts: {
//         $get: (data: { query: { symbol: string } }) => Promise<Response>
//     }
// }


// console.log('check 1' )
// app.get('/api/price-service/single', async (c) => {
// 	console.log('check 2' )
// 	try {
// 		const symbol = c.req.query('symbol');
// 		console.log('check 3' )
// 		if (!symbol) {
// 			return c.json({ error: 'Symbol is required' }, 400);
// 		}
// 		const baseUrl = c.env?.PRICE_SERVICE_URL.fetch('https://price-service.a84012807.workers.dev');
//         console.log('Base URL:', baseUrl);

//         const client = hc<AppType>(baseUrl);
        
//         // 建構完整 URL 用於記錄
//         const fullUrl = `${baseUrl}/posts?symbol=${encodeURIComponent(symbol)}`;
//         console.log('完整請求 URL:', fullUrl);

// 		const res = await (client as unknown as PriceServiceClient).posts.$get({
// 			query: {
// 				symbol: symbol
// 			}
// 		});
// 		console.log('res', res);

// 		if (res.ok) {
// 			const data = await res.json();
// 			console.log('data', data);
// 			return c.json(data);
// 		}	
// 		console.log('res', await res.json());
// 		return c.json({ error: 'Failed to get response' }, 500);
// 	} catch (error) {
// 		return c.json(
// 			{
// 				error: error instanceof Error ? error.message : 'Internal server error',
// 			},
// 			500,
// 		);
// 	}
// });

// export default app;

// app.get('/api/price', async (c) => {
// 	const symbol = c.req.query('symbol');

// 	if (!symbol) {
// 		return c.json({ error: 'Symbol is required' }, 400);
// 	}

// 	try {
// 		const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));

//         const cache = await caches.open(Edge_Cache_Config.NAMESPACE);
//         const cachedResponse = await cache.match(cacheKey);

//         if (cachedResponse) {
//             const cachedData = await cachedResponse.json();
//             console.log('Cached data:', cachedData);
//             return cachedResponse;
//         }

// 		const res = await (c.env as unknown as ServiceBindings).PRICE_SERVICE.getPriceBySymbol(symbol);
//         if (res.price) {
//             return c.json(res);
//         }
//         return c.json({ error: 'Price not found' }, 404);
// 	} catch (error) {
// 		return c.json(
// 			{
// 				error: error instanceof Error ? error.message : 'Internal server error',
// 			},
// 			500,
// 		);
// 	}
// });

// app.post('/api/prices', async (c) => {
// 	const { symbols } = await c.req.json<{ symbols: string[] }>();

// 	if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
// 		return c.json({ error: 'Valid symbols array is required' }, 400);
// 	}

// 	try {
// 		// 使用 RPC 呼叫 Price Service
// 		const response = await (c.env as unknown as ServiceBindings).PRICE_SERVICE.getBatchPrices(symbols)

//         return c.json(response);
// 	} catch (error) {
// 		return c.json(
// 			{
// 				error: error instanceof Error ? error.message : 'Internal server error',
// 			},
// 			500,
// 		);
// 	}
// });

// export default app;
/////////////////////////////////////

// import { hc } from "hono/client";
// import type { AppType } from "../../price-service/src/index";
// import { Hono } from "hono";

// const app = new Hono();

// app.get("/", async (c) => {
//     console.log('開始處理請求');
//     try {
//         // const client = hc<AppType>(c.env.PRICE_SERVICE_URL);
// 		const response = await c.env.PRICE_SERVICE.fetch(new Request('http://localhost:8100/book'));
//         console.log('response', response);
// 		const data = await response.json();
//         console.log('Price Service URL:', c.env.PRICE_SERVICE_URL);
        
//         // const res = await client.book.$get();
//         console.log('Response status:', data);
        
//         // 檢查回應狀態
//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error('API 錯誤回應:', errorText);
//             return c.json({ error: '服務請求失敗', details: errorText }, 500);
//         }
        
//         try {
//             // const data = await response.json();
//             console.log('成功解析的數據:', data);
//             return c.json(data);
//         } catch (parseError) {
//             const rawText = await response.text();
//             console.error('JSON 解析錯誤:', parseError);
//             console.error('原始回應內容:', rawText);
//             return c.json({ error: 'JSON 解析失敗', rawResponse: rawText }, 500);
//         }
//     } catch (error) {
//         console.error('請求處理錯誤:', error);
//         return c.json({
//             error: '內部服務錯誤',
//             message: error instanceof Error ? error.message : '未知錯誤'
//         }, 500);
//     }
// });

// export default app;

import { hc } from 'hono/client';
import type { AppType } from '../../price-service/src/index';
import { Hono } from 'hono';

const app = new Hono();

app.get("/", async (c) => {
    const client = hc<AppType>('http://localhost:8100');
	// 調用 RPC 方法
	const response = await client.price.$get({
		query: { symbol: 'AAPL', market: 'stock' }
	});
	console.log('response', response)
	// console.log('response', await response.json())
return c.json(response);
});

export default app;
