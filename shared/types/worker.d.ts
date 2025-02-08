import { WorkerEntrypoint } from 'cloudflare:workers';
export default class extends WorkerEntrypoint {
	add(a: number, b: number): number;
}

export interface Env {
	PRICE_SERVICE: Service<PriceService>;
}