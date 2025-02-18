import { DurableObject } from "cloudflare:workers";
import { Env, PriceService } from '../types';
import { priceFunctions } from '../api/regional-price';
import { PriceData } from "@shared/types";

export class RegionalDO extends DurableObject<Env> {
    private priceService: PriceService;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
        this.priceService = env.PRICE_SERVICE;
	}

	// 處理不同路徑的請求
	async fetch(request: Request): Promise<Response> {

		const pathSegments = new URL(request.url).pathname.split('/').filter(Boolean);
        // 第一個段落作為主路由
		const mainRoute = pathSegments[0];
		// 剩餘的段落作為參數
		const params = pathSegments.slice(1);

		switch (mainRoute) {
			case 'prices':
				console.log("handlePrices", request);
				return await this.handlePrices(request, params);
			// case 'assets':
			// 	console.log("handleAssets", request);
			// 	return await this.handleAssets(request, params);
			// case 'subscribe':
			// 	console.log("handleSubscribe", request);
			// 	return await this.handleSubscribe(request, params);
			default:
				return new Response('Not Found', { status: 404 });
		}
	}

	// 處理價格相關邏輯
	private async handlePrices(request: Request, params: string[]): Promise<Response> {
		try {
            // 根據請求方法分流處理
            switch (request.method) {
                case 'GET': {
                    const result = await priceFunctions.getSinglePrice(this.priceService, params[0]);
                    return new Response(JSON.stringify(result), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                case 'POST': {
                    if (params[0] === 'batch') {
                        const { symbols } = await request.json() as { symbols: string[] };
                        if (!Array.isArray(symbols) || symbols.length === 0) {
                            return new Response('Invalid payload format', { status: 400 });
                        }
                        const result = await priceFunctions.getBatchPrices(this.priceService, symbols);
                        return new Response(JSON.stringify(result), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    return new Response('Invalid endpoint', { status: 404 });
                }
                default:
                    return new Response('Method not allowed', { status: 405 });
            }
        } catch (error) {
			console.error("Error handling prices:", error);
            return new Response('Internal Server Error', { 
                status: 500,
                statusText: error instanceof Error ? error.message : 'Unknown error'
            });
		}
	}
	// 處理資產相關邏輯
	// private async handleAssets(request: Request, params: string[]): Promise<Response> {
	// 	// 資產服務邏輯
	// 	console.log("handleAssets", request);
	// 	return new Response('Asset Service Response');
	// }

	// 處理訂閱相關邏輯
	// private async handleSubscribe(request: Request, params: string[]): Promise<Response> {
	// 	// WebSocket 訂閱邏輯
	// 	console.log("handleSubscribe", request);
	// 	return new Response('Subscribe Service Response');
	// }
}