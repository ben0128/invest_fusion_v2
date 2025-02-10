import { PriceData } from './price';

export interface ApiErrorResponse {
	code: ErrorCode;
	message: string;
	statusCode?: number;
}

export interface ApiResponse {
	success: boolean;
	error?: ApiErrorResponse;
	data?: unknown;
}

// 定義所有可能的錯誤代碼
export enum ErrorCode {
	INVALID_INPUT = 'INVALID_INPUT',
	SERVICE_ERROR = 'SERVICE_ERROR',
	EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
	NOT_FOUND = 'NOT_FOUND',
	RATE_LIMIT = 'RATE_LIMIT',
}

// 自定義錯誤類別
export class AppError extends Error {
	constructor(
		public code: ErrorCode,
		message: string,
		public statusCode: number = 500,
	) {
		super(message);
		this.name = 'AppError';
	}
}

// 定義API回應的型別
export type SinglePriceResponse = ApiResponse<PriceData>;
export type BatchPriceResponse = ApiResponse<PriceData[]>;
