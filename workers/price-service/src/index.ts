import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env, PriceApiError, PriceData } from 'shared/types';
import { z } from 'zod';
import { PriceApiService } from './services/priceApi';

console.log('check 0')

class PriceService extends WorkerEntrypoint {
    private priceApiService: PriceApiService | null = null;
    private initPriceApiService(env: Env) {
        if (!this.priceApiService) {
            this.priceApiService = new PriceApiService(
                env.TWELVE_DATA_API_URL,
                env.TWELVE_DATA_API_KEY,
                parseInt(env.CACHE_TTL),
                parseInt(env.MAX_BATCH_SIZE),
                (caches as any).default,
                // PriceApiError
            );
        }
        return this.priceApiService;
    };


	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        console.log('check PriceService fetch')
		return new Response('Hello from Price Service!');
	};

	add(a: number, b: number): number {
		const schema = z.object({
			a: z.number(),
			b: z.number()
		});

		const result = schema.safeParse({ a, b });
		console.log('result', result);
		if (!result.success) {
			throw new Error('參數驗證失敗: ' + result.error);
		}

		console.log('add', a, b);
		return a + b;
	};

    async getPrice(symbol: string): Promise<PriceData> {
        const env = this.env as Env;
        console.log('env', env);
        console.log('symbol', symbol);
        const priceApiService = this.initPriceApiService(env);
        const res: PriceData = await priceApiService.getPrice(symbol);
        console.log('res', res);
        return res;
    };
}

export default PriceService;