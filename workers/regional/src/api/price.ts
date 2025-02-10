import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator'
import { Env } from '../types';
import { createLogger } from 'shared/utils/logger';
import { symbolSchema, batchSymbolsSchema } from 'shared/schemas/price.schema';

const logger = createLogger('PriceAPI');
const price = new Hono<{ Bindings: Env }>();

// GET /prices/:symbol - 獲取單一股票價格
price.get('/:symbol',
    zValidator('param', symbolSchema),
    async (c) => {
        try {
            // 驗證過的參數可以直接使用
            const { symbol } = c.req.valid('param');
            
            const res = await c.env.PRICE_SERVICE.getPrice(symbol);
            return c.json({ result: res });
        } catch (error) {
            logger.error('錯誤:', error);
            return c.json({ error: '計算失敗' }, 500);
        }
    }
);

// POST /prices/batch - 批量獲取股票價格
price.post('/batch',
    zValidator('json', batchSymbolsSchema),
    async (c) => {
        try {
            // 驗證過的 body 可以直接使用
            const { symbols } = c.req.valid('json');
            logger.info('批量請求股票:', symbols);
            
            const res = await c.env.PRICE_SERVICE.getBatchPrices(symbols);
            return c.json({ result: res });
        } catch (error) {
            logger.error('錯誤:', error);
            return c.json({ error: '計算失敗' }, 500);
        }
    }
);

export default price; 