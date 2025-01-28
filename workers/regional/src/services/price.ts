import { PriceData, API_ENDPOINTS, CACHE_KEYS } from '@invest-fusion/shared';

export async function fetchPrice(symbol: string): Promise<PriceData> {
  const response = await fetch(`${API_ENDPOINTS.TWELVE_DATA}/price?symbol=${symbol}`);
  const data = await response.json();
  
  return {
    symbol,
    price: parseFloat(data.price),
    timestamp: Date.now()
  };
} 