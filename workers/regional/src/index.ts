import { Hono } from 'hono';
// import { cors } from 'hono/cors';
import { Env } from './types';

const app = new Hono<{ Bindings: Env }>();
// app.use('/*', cors());

// 測試路由
app.get('/add1', async (c) => {
    try {
        const res = await c.env.PRICE_SERVICE.add(5, 7);
        return c.json({ result: res });
    } catch (error) {
        console.error('錯誤:', error);
        return c.json({ error: '計算失敗' }, 500);
    }
});

app.get('/getPrice', async (c) => {
    try {
        const res = await c.env.PRICE_SERVICE.getPrice('AAPL');
        return c.json({ result: res });
    } catch (error) {
        console.error('錯誤:', error);
        return c.json({ error: '計算失敗' }, 500);
    }
});

export default app;