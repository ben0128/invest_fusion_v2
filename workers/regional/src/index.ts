import { Hono } from 'hono';
// import { cors } from 'hono/cors';
import { Env } from './types';
import priceApi from './api/price';

const app = new Hono<{ Bindings: Env }>();
// app.use('/*', cors());

app.route('/prices', priceApi);

export default app;