import { Hono } from 'hono';
// import { cors } from 'hono/cors';
import { Env } from './types';
import priceApi from './api/price';

const app = new Hono<{ Bindings: Env }>();
// app.use('/*', cors());

app.route('/prices', priceApi);
app.onError((e, c) => {
    return new Response(e?.message, {
        status: c?.res?.status || 500,
    })
});



app.onError((e, c) => {
    return new Response(e?.message, {
        status: c?.res?.status || 500,
    })
});


export default app;