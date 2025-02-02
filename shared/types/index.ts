/** 資產類型列舉 */
export enum AssetType {
	CRYPTO = 'crypto',
	BINANCE = 'binance',
	US_STOCK = 'us_stock',
	TW_STOCK = 'tw_stock',
}

/** 資產介面定義 */
export interface Asset {
	id: string;
	type: AssetType;
	symbol: string;
	amount: number;
	value?: number;
}

/** 價格資料介面 */
export interface PriceData {
	symbol: string;
	price: number;
	timestamp: number;
}

/** Worker 環境變數綁定 */
export interface Bindings {
	TWELVE_DATA_API_URL: string;
	TWELVE_DATA_API_KEY: string;
	CACHE_TTL: number;
	MAX_BATCH_SIZE: number;
	CACHE: Cache;
	PriceApiError: typeof PriceApiError;
}

export type RawPriceData = {
	price: number;
};

export class PriceApiError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number = 500,
		public readonly symbol?: string
	) {
		super(message);
		this.name = 'PriceApiError';
	}
}

export interface BatchPriceResponse {
	[symbol: string]: { price: number };
}

// RPC 方法定義
export interface PriceServiceRPC {
	getPriceBySymbol(symbol: string): Promise<number>;
	getBatchPrices(symbols: string[]): Promise<Record<string, number>>;
}

// RPC 請求格式
export interface RPCRequest {
	method: string;
	params: any;
}

// RPC 回應格式
export interface RPCResponse {
	result?: any;
	error?: {
		code: number;
		message: string;
	};
}

// Fetcher 介面定義
export interface Fetcher {
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}