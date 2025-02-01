# 多元資產管理平台

## 專案概述

這是一個整合性的資產管理平台，支援多種資產類型的即時追蹤和管理，包含：

- 區塊鏈錢包
- 幣安交易所資產
- 美股投資部位
- 台股券商倉位

系統提供即時價格更新、資產總值計算，以及完整的資產組合視覺化功能。

## 技術架構

### 核心服務

系統採用分散式架構，主要分為以下幾個部分：

1. **認證與資料儲存層 (Firebase)**

    - 使用者認證與授權
    - 資產清單及用戶設定儲存
    - Edge Functions 處理認證觸發事件

2. **價格更新服務 (Cloudflare)**

    - Regional Workers 作為地區接入層
    - Durable Objects 處理價格協調
    - Workers Cache 作為價格快取層

3. **外部數據整合**
    - 12Data API 整合，提供即時市場數據
    - 幣安 API 整合
    - 區塊鏈錢包查詢整合

### 資料流程

#### 登入流程

1. 用戶進行 GIP 認證
2. Cloud Functions 處理認證邏輯
3. 返回 JWT 令牌與初始資產清單
4. 資產清單同步至價格查詢服務

#### 價格更新流程

1. Regional Worker 接收價格請求
2. 檢查 Worker Cache 快取狀態
3. 快取命中則直接返回數據
4. 快取未命中則通知 DO 進行查詢
5. 更新快取並返回數據

## 開發環境設置

### 必要條件

```bash
bun.js >= 1.2.0
```

### 環境變數配置

```env
# Firebase 配置
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Cloudflare 配置
CF_ACCOUNT_ID=your_cf_account_id
CF_API_TOKEN=your_cf_api_token

# 外部 API 配置
TWELVE_DATA_API_KEY=your_12data_api_key
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_secret
```

## 部署指南

### Firebase 部署

1. 創建 Firebase 專案
2. 部署 Edge Functions

### Cloudflare Workers 部署

1. 部署 Regional Workers
    ```bash
    wrangler deploy src/workers/regional.js
    ```
2. 部署 Price Service DO
    ```bash
    wrangler deploy src/workers/price-service.js
    ```
3. 配置 Worker Cache
    ```bash
    wrangler kv:namespace create "PRICE_CACHE"
    ```

## 本地開發

```bash
# 安裝依賴
bun install

# 運行開發服務器
bun dev

# 運行測試
bun test
```

## 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 聯絡方式

如有任何問題或建議，請開啟 Issue 或發送 Pull Request。
