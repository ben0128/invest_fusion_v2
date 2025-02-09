import { Hono } from 'hono';
import { Env } from '../types';
import { createLogger } from 'shared/utils/logger';

const logger = createLogger('PriceAPI');
const price = new Hono<{ Bindings: Env }>();

// GET /prices/:symbol - 獲取單一股票價格
price.get('/:symbol', async (c) => {
    try {
        const symbol = c.req.param('symbol');
        const res = await c.env.PRICE_SERVICE.getPrice(symbol);
        return c.json({ result: res });
    } catch (error) {
        logger.error('錯誤:', error);
        return c.json({ error: '計算失敗' }, 500);
    }
});

// POST /prices/batch - 批量獲取股票價格
price.post('/batch', async (c) => {
    try {
        const { symbols } = await c.req.json() as { symbols: string[] };
        logger.info('批量請求股票:', symbols);
        if (!Array.isArray(symbols)) {
            return c.json({ error: '請提供正確的股票代號陣列' }, 400);
        }
        const res = await c.env.PRICE_SERVICE.getBatchPrices(symbols);
        return c.json({ result: res });
    } catch (error) {
        logger.error('錯誤:', error);
        return c.json({ error: '計算失敗' }, 500);
    }
});

export default price; 