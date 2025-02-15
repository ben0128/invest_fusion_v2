import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// 模擬 Cloudflare Cache API
const mockCache = {
  match: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

// 模擬 global fetch
const mockFetch = vi.fn();

beforeAll(() => {
  // 設置全域模擬
  global.fetch = mockFetch;
  global.caches = {
    default: mockCache
  } as unknown as CacheStorage;
});

afterEach(() => {
  // 清理每次測試的模擬狀態
  vi.clearAllMocks();
});

afterAll(() => {
  // 清理全域模擬
  vi.restoreAllMocks();
});

export { mockCache, mockFetch }; 