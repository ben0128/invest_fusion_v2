import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ServiceBindings } from 'shared/types';
import { Edge_Cache_Config } from 'shared/constants';
const app = new Hono();

// 啟用 CORS
app.use('/*', cors());

app.get('/api/price', async (c) => {
	const symbol = c.req.query('symbol');

	if (!symbol) {
		return c.json({ error: 'Symbol is required' }, 400);
	}

	try {
		const cacheKey = new Request(Edge_Cache_Config.getCacheKey(symbol));

        const cache = await caches.open(Edge_Cache_Config.NAMESPACE);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            const cachedData = await cachedResponse.json();
            console.log('Cached data:', cachedData);
            return cachedResponse;
        }
		const res = await (c.env as unknown as ServiceBindings).PRICE_SERVICE.getPriceBySymbol(symbol);
        if (res.price) {
            return c.json(res);
        }
        return c.json({ error: 'Price not found' }, 404);
	} catch (error) {
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			500,
		);
	}
});

app.post('/api/prices', async (c) => {
	const { symbols } = await c.req.json<{ symbols: string[] }>();

	if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
		return c.json({ error: 'Valid symbols array is required' }, 400);
	}

	try {
		// 使用 RPC 呼叫 Price Service
		const response = await (c.env as unknown as ServiceBindings).PRICE_SERVICE.getBatchPrices(symbols)

        return c.json(response);
	} catch (error) {
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			500,
		);
	}
});

export default app;
