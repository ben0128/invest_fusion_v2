// 初始化, 設定環境變數, 能夠接收地區DO的標的請求,並回傳標的價格
// import { cors } from 'hono/cors';
import { Bindings, PriceApiError } from 'shared/types';
import { PriceApiService } from './services/priceApi';

let priceService: PriceApiService;

const app = {
    // 初始化 service
    async init(env: Bindings) {
        if (!priceService) {
            priceService = new PriceApiService(
                env.TWELVE_DATA_API_URL,
                env.TWELVE_DATA_API_KEY,
                parseInt(env.CACHE_TTL),
                parseInt(env.MAX_BATCH_SIZE),
                caches.default,
                PriceApiError
            );
        }
    },

    // RPC 方法
    async getBatchPrices(symbols: string[], env: Bindings) {
        await this.init(env);
        return await priceService.getBatchPrices(symbols);
    },

    async getPriceBySymbol(symbol: string, env: Bindings) {
        await this.init(env);
        return await priceService.getPrice(symbol);
    }
};
export default app;
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
