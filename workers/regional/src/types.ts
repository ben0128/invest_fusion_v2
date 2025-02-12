import { WorkerEntrypoint } from 'cloudflare:workers';
import { PriceData } from '@shared/types';
export interface PriceService extends WorkerEntrypoint {
	add(a: number, b: number): number;
<<<<<<< HEAD
	getPrice(symbol: string): Promise<PriceData>;
	getBatchPrices(symbols: string[]): Promise<PriceData[]>;
=======
	getPrice(symbol: string): Promise<number>;
	getBatchPrices(symbols: string[]): Promise<number[]>;
>>>>>>> main
	// ... existing code ...
}

export interface Env {
	PRICE_SERVICE: Service<PriceService>;
<<<<<<< HEAD
	CACHE_TTL: string;
=======
>>>>>>> main
}
