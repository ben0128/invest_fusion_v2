import { ErrorCode } from '../types/api';

export interface ErrorMetadata {
  code: ErrorCode;
  statusCode: number;
  message: string;
}

export const ErrorTypes = {
  INVALID_SYMBOL: {
    code: ErrorCode.INVALID_INPUT,
    statusCode: 400,
    message: '無效的股票代號格式'
  },
  PRICE_FETCH_FAILED: {
    code: ErrorCode.SERVICE_ERROR,
    statusCode: 500,
    message: '獲取價格失敗'
  },
  SYMBOL_NOT_FOUND: {
    code: ErrorCode.NOT_FOUND,
    statusCode: 404,
    message: '找不到此股票代號'
  },
  BATCH_PRICE_FETCH_FAILED: {
    code: ErrorCode.SERVICE_ERROR,
    statusCode: 500,
    message: '批量獲取價格失敗'
  },
  EXTERNAL_API_ERROR: {
    code: ErrorCode.EXTERNAL_API_ERROR,
    statusCode: 502,
    message: '外部服務異常'
  },
  RATE_LIMIT_EXCEEDED: {
    code: ErrorCode.RATE_LIMIT,
    statusCode: 429,
    message: '請求次數超過限制'
  }
} as const; 