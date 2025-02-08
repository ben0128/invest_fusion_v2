import { WorkerEntrypoint } from 'cloudflare:workers';

export interface PriceService extends WorkerEntrypoint {
    add(a: number, b: number): number;
    // ... existing code ...
}

export interface Env {
    PRICE_SERVICE: Service<PriceService>;
}
