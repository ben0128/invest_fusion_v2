// import { Hono } from 'hono';
// import { cors } from 'hono/cors';
import { Env } from './types';
import { RegionalDO } from './durable-object';
import { Response, ExportedHandler, Request, CfProperties } from '@cloudflare/workers-types';
// 需要導出 RegionalDO
export { RegionalDO };

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {
		// We will create a `DurableObjectId` using the pathname from the Worker request
		// This id refers to a unique instance of our 'MyDurableObject' class above

		// 根據 request.cf.continent 決定要使用的 Durable Object, 先分兩種就好
		const DoLocation = (request?.cf?.continent === 'AS') ? 'AS' : 'Other';
		const id: DurableObjectId = env.REGIONAL_DO.idFromName(DoLocation);
		// This stub creates a communication channel with the Durable Object instance
		// The Durable Object constructor will be invoked upon the first call for a given id
		const stub = env.REGIONAL_DO.get(id);

		const response: Response = await stub.fetch(request);
		return response;
	},
} satisfies ExportedHandler<Env, Request<unknown, CfProperties<unknown>>>;