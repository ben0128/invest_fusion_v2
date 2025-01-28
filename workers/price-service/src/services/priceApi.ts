import { Context } from 'hono'
import { PriceData } from 'shared/types'

export class PriceApiService {
  constructor(
    private readonly apiKey: string, 
    private readonly cacheTTL: number,
    private readonly maxBatchSize: number,
    private readonly cache: Cache
  ) {}

  private getCacheKey(symbol: string): string {
    return `https://api.price-cache.local/prices/${symbol.toUpperCase()}`
  }

  async getPrice(symbol: string): Promise<PriceData> {
    const startTime = Date.now()
    const cacheKey = this.getCacheKey(symbol)
    
    try {
      // 嘗試從快取中獲取數據
      const cachedResponse = await this.cache.match(new Request(cacheKey))
      if (cachedResponse) {
        const cachedData = await cachedResponse.json()
        console.log(`Cache hit for ${symbol}: ${cachedData.price}`)
        return cachedData
      }

      // 如果快取中沒有，則從 API 獲取
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${this.apiKey}`
      )
      const data = await response.json()
      
      if (data.code === 400) {
        throw new Error(data.message)
      }

      // 準備要快取的數據
      const priceData: PriceData = {
        symbol: symbol,
        price: data.price,
        timestamp: Date.now()
      }

      // 存入快取
      await this.cache.put(
        new Request(cacheKey),
        new Response(JSON.stringify(priceData), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `max-age=${this.cacheTTL}`
          }
        })
      )
      
      const endTime = Date.now()
      console.log(`${symbol}: ${data.price}, Time taken: ${endTime - startTime}ms`)
      
      return priceData
    } catch (error) {
      console.error('Error fetching price:', error)
      throw error
    }
  }

  async invalidateCache(symbol: string): Promise<void> {
    const cacheKey = this.getCacheKey(symbol)
    await this.cache.delete(new Request(cacheKey))
  }
}

export async function handleGetPrice(c: Context) {
  const symbol = c.req.query('symbol')
  
  if (!symbol) {
    return c.json({ error: 'Symbol is required' }, 400)
  }

  try {
    // 使用 caches.default 獲取預設的快取實例
    const cache = caches.default
    const priceApi = new PriceApiService(
      c.env.TWELVE_DATA_API_KEY,
      c.env.CACHE_TTL,
      c.env.MAX_BATCH_SIZE,
      cache
    )
    const data = await priceApi.getPrice(symbol)
    return c.json(data)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: 'Failed to fetch price' }, 500)
  }
} 