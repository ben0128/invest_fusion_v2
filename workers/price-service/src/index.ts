import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env, PriceData } from 'shared/types';
import { z } from 'zod';
import { PriceApiService } from './services/priceApi';
import { createLogger } from 'shared/utils/logger';

class PriceService extends WorkerEntrypoint {
    private priceApiService: PriceApiService | null = null;
    private static logger = createLogger('PriceService');

    private initPriceApiService(env: Env) {
        if (!this.priceApiService) {
            this.priceApiService = new PriceApiService(
                env.TWELVE_DATA_API_URL,
                env.TWELVE_DATA_API_KEY,
                parseInt(env.CACHE_TTL),
                parseInt(env.MAX_BATCH_SIZE),
                (caches as any).default,
                PriceService.logger
            );
        }
        return this.priceApiService;
    };


	async fetch(): Promise<Response> { 
        return new Response('Hello from Price Service!') 
    };

    async getPrice(symbol: string): Promise<PriceData> {
        PriceService.logger.info('getPrice', { symbol });
        const env = this.env as Env;
        const priceApiService = this.initPriceApiService(env);
        const res: PriceData = await priceApiService.getPrice(symbol);
        return res;
    };

    async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
        PriceService.logger.info('getBatchPrices', { symbols });
        const env = this.env as Env;
        const priceApiService = this.initPriceApiService(env);
        const res: PriceData[] = await priceApiService.getBatchPrices(symbols);

        return res;
    };
}

export default PriceService;