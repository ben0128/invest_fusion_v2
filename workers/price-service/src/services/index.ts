// 初始化, 設定環境變數, 能夠接收地區DO的標的請求,並回傳標的價格
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handleGetPrice } from './priceApi'
import { Bindings } from 'shared/types'


const app = new Hono<{ Bindings: Bindings }>()
// 啟用 CORS
app.use('/*', cors())

// 基本健康檢查
app.get('/', (c) => c.text('Price Service is running!'))

// 取得價格的端點
app.get('/api/price', handleGetPrice)

export default app