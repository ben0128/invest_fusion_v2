import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env, PriceData } from 'shared/types';
import { PriceApiService } from './services/priceApi';
import { createLogger } from 'shared/utils/logger';
import { symbolSchema } from 'shared/schemas/price.schema';

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
				caches.default,
				PriceService.logger,
			);
		}
		return this.priceApiService;
	}

	async fetch(): Promise<Response> {
		return new Response('Hello from Price Service!');
	}

	async getPrice(symbol: string): Promise<PriceData> {
		PriceService.logger.info('getPrice', { symbol });
		try {
			const { symbol: validSymbol } = symbolSchema.parse({ symbol });
			const env = this.env as Env;
			const priceApiService = this.initPriceApiService(env);
			return await priceApiService.getPrice(validSymbol);
		} catch (error) {
			PriceService.logger.error('批量獲取價格失敗', { symbol, error });
			throw error;
		}
	}

	async getBatchPrices(symbols: string[]): Promise<PriceData[]> {
		PriceService.logger.info('getBatchPrices', { symbols });
		try {
			const env = this.env as Env;
			const priceApiService = this.initPriceApiService(env);
			return await priceApiService.getBatchPrices(symbols);
		} catch (error) {
			PriceService.logger.error('批量獲取價格失敗', { symbols, error });
			throw error;
		}
	}
}

export default PriceService;
