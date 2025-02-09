import { Hono } from 'hono';
// import { cors } from 'hono/cors';
import { Env } from './types';
import { createLogger } from 'shared/utils/logger';

const logger = createLogger('Regional');

const app = new Hono<{ Bindings: Env }>();
// app.use('/*', cors());

app.get('/getPrice', async (c) => {
    try {
        const res = await c.env.PRICE_SERVICE.getPrice('AAPL');
        return c.json({ result: res });
    } catch (error) {
        logger.error('錯誤:', error);
        return c.json({ error: '計算失敗' }, 500);
    }
});

app.post('/getBatchPrices', async (c) => {
    try {
        const { symbols } = await c.req.json() as { symbols: string[] };
		logger.info('c.req', symbols);
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

export default app;