export interface Env {
	PRICE_SERVICE: Service<PriceService>;
    TWELVE_DATA_API_URL: string;
    TWELVE_DATA_API_KEY: string;
    CACHE_TTL: string;
    MAX_BATCH_SIZE: string;
    logger: Logger;
    AppError: AppError;
}