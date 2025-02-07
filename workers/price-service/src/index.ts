// // 初始化, 設定環境變數, 能夠接收地區DO的標的請求,並回傳標的價格
// import { Hono } from 'hono';
// import { cors } from 'hono/cors';
// import { Bindings, PriceApiError } from 'shared/types';
// import { PriceApiService } from './services/priceApi';
// import { z } from 'zod';
// import { zValidator } from '@hono/zod-validator';  // 添加這行


// const app = new Hono<{ Bindings: Bindings }>();
// app.use('/*', cors());

// // 定義路由
// app.get('/posts', 
//     zValidator('query', z.object({
//         symbol: z.string()
//     })),
//     async (c) => {
//         const { symbol } = c.req.valid('query');
//         console.log('Received symbol:', symbol);
        
//         return c.json({
//             ok: true,
//             data: { symbol }
//         }, 200);
//     }
// );

// // 添加錯誤處理中間件
// app.onError((err, c) => {
//     console.error('Error:', err);
//     return c.json({
//         ok: false,
//         message: err.message
//     }, err instanceof PriceApiError ? err.status : 500);
// });

// export type AppType = typeof app;
// export default app;
// const route = app.post(
// 	'/posts',
// 	zValidator(
// 		'json',
// 		z.object({
// 			title: z.string(),
// 			body: z.string(),
// 		}),
// 	),
// 	(c) => {
//         const data = c.req.valid('json');
//         console.log('Received data:', data);
// 		return c.json(
// 			{
// 				ok: true,
// 				message: 'Created!',
//                 data: data
// 			},
// 			201,
// 		);
// 	},
// );

// export type AppType = typeof route

// let priceService: PriceApiService;

// const app = {
//     // 初始化 service
//     async init(env: Bindings) {
//         if (!priceService) {
//             priceService = new PriceApiService(
//                 env.TWELVE_DATA_API_URL,
//                 env.TWELVE_DATA_API_KEY,
//                 parseInt(env.CACHE_TTL),
//                 parseInt(env.MAX_BATCH_SIZE),
//                 caches.default,
//                 PriceApiError
//             );
//         }
//     },

//     // RPC 方法
//     async getBatchPrices(symbols: string[], env: Bindings) {
//         await this.init(env);

//         return await priceService.getBatchPrices(symbols);
//     },

//     async getPriceBySymbol(symbol: string, env: Bindings) {

//         await this.init(env);

//         return await priceService.getPrice(symbol);
//     }
// };
// export default app;
// 添加 fetch 處理器
// export default {
//     async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
//         // 解析請求體
//         const { method, params } = await request.json();
//         console.log('request', request);
//         try {
//             switch (method) {
//                 case 'getBatchPrices':
//                     const batchResult = await app.getBatchPrices(params.symbols, env);
//                     return new Response(JSON.stringify(batchResult), {
//                         headers: { 'Content-Type': 'application/json' }
//                     });

//                 case 'getPriceBySymbol':
//                     const priceResult = await app.getPriceBySymbol(params.symbol, env);
//                     return new Response(JSON.stringify(priceResult), {
//                         headers: { 'Content-Type': 'application/json' }
//                     });

//                 default:
//                     return new Response(
//                         JSON.stringify({ error: `Unknown method: ${method}` }), 
//                         { status: 400 }
//                     );
//             }
//         } catch (error) {
//             console.error('RPC Error:', error);
//             const status = error instanceof PriceApiError ? error.status : 500;
//             return new Response(
//                 JSON.stringify({ error: error.message }), 
//                 { status }
//             );
//         }
//     }
// };

// import { Hono } from "hono";
// import bookRoute from "./book";
// const app = new Hono();

// console.log('check 1')
// const route = app.route("/book", bookRoute);

// export type AppType = typeof route;
// export default app;

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

// 定義 RPC 風格的路由
const priceRoute = new Hono()
  .get('/', zValidator('query', z.object({
    symbol: z.string(),
    market: z.enum(['crypto', 'stock'])
  }), (c) => {
    // const { symbol, market } = c.req.query();
    console.log('check 2', c.data)
    // 處理價格查詢邏輯
    return c.data;
  })
  )
app.route('/price', priceRoute);

export type AppType = typeof app;
export default app;