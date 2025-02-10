import { Hono } from 'hono';

import { zValidator } from '@hono/zod-validator'
import { Env } from '../types';
import { createLogger } from 'shared/utils/logger';
import { symbolSchema, batchSymbolsSchema } from 'shared/schemas/price.schema';
import { SinglePriceResponse, BatchPriceResponse } from 'shared/types/api';
import { AppError } from 'shared/errors/AppError';


const logger = createLogger('PriceAPI');
const price = new Hono<{ Bindings: Env }>();

// GET /prices/:symbol - 獲取單一股票價格

price.get('/:symbol',
    zValidator('param', symbolSchema),
    async (c) => {
        const { symbol } = c.req.valid('param');
        
        try {
            const res = await c.env.PRICE_SERVICE.getPrice(symbol);
            const response: SinglePriceResponse = {
                success: true,
                data: res
            };
            return c.json(response);
        } catch (error) {
            // logger.error('處理請求失敗:', error.message);
            // throw AppError.priceFetchFailed();
            throw error;
        }
    }
);

// POST /prices/batch - 批量獲取股票價格
price.post('/batch',
    zValidator('json', batchSymbolsSchema),
    async (c) => {
        const { symbols } = c.req.valid('json');
        logger.info('批量請求股票:', symbols);
        
        try {
            const res = await c.env.PRICE_SERVICE.getBatchPrices(symbols);
            const response: BatchPriceResponse = {
                success: true,
                data: res
            };
            return c.json(response);
        } catch (error) {
            logger.error('處理批量請求失敗:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw AppError.batchPriceFetchFailed();
        }
    }
);


export default price; 