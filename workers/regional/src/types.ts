import { WorkerEntrypoint } from 'cloudflare:workers';
import { PriceData } from '@shared/types';
import { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface PriceService extends WorkerEntrypoint {
	getSinglePrice(symbol: string): Promise<PriceData>;
	getBatchPrices(symbols: string[]): Promise<PriceData[]>;
	// ... existing code ...
}

export interface Env {
	REGIONAL_DO: DurableObjectNamespace;
	PRICE_SERVICE: any;
	CACHE_TTL: string;
	// ... 其他環境變數
}
