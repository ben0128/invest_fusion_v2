/** 價格資料介面 */
export interface PriceData {
    symbol: string;
    price: number;
    timestamp?: number;
    code?: number;
    status?: string;
    message?: string;
}

export type RawPriceData = {
    price: number;
    code?: number;
    status?: string;
    message?: string;
};

export interface BatchPriceResponse {
    [symbol: string]: { price: number };
}

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