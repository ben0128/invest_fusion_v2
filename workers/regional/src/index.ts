import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Bindings, PriceData } from 'shared/types';

// 定義 Env interface 來符合 Cloudflare Workers 的類型要求
interface Env {
	PRICE_SERVICE: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// 啟用 CORS
app.use('/*', cors());

// app.get('/api/price', async (c) => {
// 	const symbol = c.req.query('symbol');

// 	if (!symbol) {
// 		return c.json({ error: 'Symbol is required' }, 400);
// 	}

// 	try {
// 		const price = await priceService.getPriceBySymbol(symbol);
// 		return c.json({ symbol, price });
// 	} catch (error) {
// 		return c.json(
// 			{
// 				error: error instanceof Error ? error.message : 'Internal server error',
// 			},
// 			500,
// 		);
// 	}
// });

app.post('/api/prices', async (c) => {
	const { symbols } = await c.req.json<{ symbols: string[] }>();

	if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
		return c.json({ error: 'Valid symbols array is required' }, 400);
	}

	try {
		// 使用 RPC 呼叫 Price Service
		const response = await c.env.PRICE_SERVICE.fetch('http://price-service/rpc', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				method: 'getBatchPrices',
				params: { symbols }
			})
		});

		if (!response.ok) {
			throw new Error(`Price service error: ${response.statusText}`);
		}

		const result = await response.json();
		return c.json(result);
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
