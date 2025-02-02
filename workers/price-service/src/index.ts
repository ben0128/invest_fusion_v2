// 初始化, 設定環境變數, 能夠接收地區DO的標的請求,並回傳標的價格
// import { cors } from 'hono/cors';
import { Bindings, PriceApiError } from 'shared/types';
import { PriceApiService } from './services/priceApi';


let priceService: PriceApiService;

const app = {
    // 初始化 service
    async init(env: Bindings) {
        priceService = new PriceApiService(
            env.TWELVE_DATA_API_URL,
            env.TWELVE_DATA_API_KEY,
            parseInt(env.CACHE_TTL),
            parseInt(env.MAX_BATCH_SIZE),
            caches.default,
            PriceApiError
        );
    },

    // RPC 方法
    async getBatchPrices(symbols: string[], env: Bindings) {
        if (!priceService) {
            await this.init(env);
        }
        return await priceService.getBatchPrices(symbols);
    },

    async getPriceBySymbol(symbol: string, env: Bindings) {
        if (!priceService) {
            await this.init(env);
        }
        return await priceService.getPrice(symbol);
    }
};
export default app;
