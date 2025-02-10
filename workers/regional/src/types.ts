import { WorkerEntrypoint } from 'cloudflare:workers';

export interface PriceService extends WorkerEntrypoint {
	add(a: number, b: number): number;
	getPrice(symbol: string): Promise<number>;
	getBatchPrices(symbols: string[]): Promise<number[]>;
	// ... existing code ...
}

export interface Env {
	PRICE_SERVICE: Service<PriceService>;
}
