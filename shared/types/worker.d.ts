import { WorkerEntrypoint } from 'cloudflare:workers';
export default class extends WorkerEntrypoint {
	add(a: number, b: number): number;
}

export interface Env {
	PRICE_SERVICE: Service<PriceService>;
    TWELVE_DATA_API_URL: string;
    TWELVE_DATA_API_KEY: string;
    CACHE_TTL: string;
    MAX_BATCH_SIZE: string;
    logger: Logger;
}