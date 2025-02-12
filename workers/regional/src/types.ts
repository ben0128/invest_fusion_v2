import { WorkerEntrypoint } from 'cloudflare:workers';
import { PriceData } from '@shared/types';
export interface PriceService extends WorkerEntrypoint {
	add(a: number, b: number): number;
	getPrice(symbol: string): Promise<PriceData>;
	getBatchPrices(symbols: string[]): Promise<PriceData[]>;
	// ... existing code ...
}

export interface Env {
	PRICE_SERVICE: Service<PriceService>;
	CACHE_TTL: string;
}
