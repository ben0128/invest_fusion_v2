import { ErrorCode } from '../types/api';
import { ErrorMetadata, ErrorTypes } from './types';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(errorType: ErrorMetadata) {
    super(errorType.message);
    this.name = 'AppError';
    this.code = errorType.code;
    this.statusCode = errorType.statusCode;
  }

  static invalidSymbol() {
    return new AppError(ErrorTypes.INVALID_SYMBOL);
  }

  static priceFetchFailed() {
    return new AppError(ErrorTypes.PRICE_FETCH_FAILED);
  }

  static symbolNotFound() {
    return new AppError(ErrorTypes.SYMBOL_NOT_FOUND);
  }

  static batchPriceFetchFailed() {
    return new AppError(ErrorTypes.BATCH_PRICE_FETCH_FAILED);
  }

  static externalApiError() {
    return new AppError(ErrorTypes.EXTERNAL_API_ERROR);
  }

  static rateLimitExceeded() {
    return new AppError(ErrorTypes.RATE_LIMIT_EXCEEDED);
  }
} 