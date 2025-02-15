import { defineConfig } from 'vitest/config';
// import react from 'vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // plugins: [react()],
  test: {
    // environment: 'jsdom',  // 前端測試用
    globals: true,
    environment: 'node', // workers 使用 node 環境
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/tests/**',
      ]
    },
    include: [
      // 指定測試檔案位置
      // 'apps/web/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'workers/*/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    setupFiles: [
      // 為不同的 worker 設置不同的 setup 檔案
      './workers/price-service/tests/setup.ts',
    ],
  },
  resolve: {
    alias: {
      // '@app': resolve(__dirname, './apps/web'),
      '@workers': resolve(__dirname, './workers'),
      'shared': resolve(__dirname, './shared'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
}); 