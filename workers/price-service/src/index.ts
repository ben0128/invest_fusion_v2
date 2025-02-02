// 初始化, 設定環境變數, 能夠接收地區DO的標的請求,並回傳標的價格
import { Hono } from 'hono';
// import { cors } from 'hono/cors';
import { Bindings, PriceApiError, PriceData, RPCRequest } from 'shared/types';
import { PriceApiService, errorHandler } from './services/priceApi';

const app = new Hono<{ Bindings: Bindings }>();

// 啟用 CORS
// app.use('/*', cors());

// 基本健康檢查
app.get('/', (c) => c.text('Price Service is running!'));

// RPC 端點
app.post('/rpc', async (c) => {
	const rpcRequest = await c.req.json<RPCRequest>();

    const env = c.env as unknown as Bindings;
	try {
		switch (rpcRequest.method) {
			case 'getBatchPrices': {
				const { symbols } = rpcRequest.params;
				
				const priceApi = new PriceApiService(
					env.TWELVE_DATA_API_URL,
					env.TWELVE_DATA_API_KEY,
					300,
					8,
					caches.default,  // 在這裡注入 caches.default
					PriceApiError,
				);
				
				const prices = await priceApi.getBatchPrices(symbols);
				return c.json({ result: prices });
			}
			
			default:
				return c.json({
					error: {
						code: 404,
						message: `Method ${rpcRequest.method} not found`
					}
				}, 404);
		}
	} catch (error) {
		return c.json({
			error: {
				code: 500,
				message: error instanceof Error ? error.message : 'Internal server error'
			}
		}, 500);
	}
});

export default app;
