Invest-Fusion_V2/
├── .env.example # 環境變數範例
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json # TypeScript 配置
│
├── apps/  
│ └── web/ # 前端應用 (Next.js)
│ ├── app/ # App Router
│ ├── components/ # React 元件
│ ├── hooks/ # Custom Hooks
│ ├── utils/ # 工具函數
│ └── **tests**/ # 前端測試
│
├── firebase/ # Firebase 相關
│ ├── functions/ # Edge Functions
│ │ └── auth/ # 認證相關函數
│ │ └── db/ # 資料庫相關函數
│ │ └── storage/ # 儲存相關函數
│ │ └── config/ # 配置相關函數
│ │ └── **tests**/ # Firebase 測試
│ └── wrangler.toml # Cloudflare Workers 配置
│
├── workers/ # Cloudflare Workers
│ ├── regional/ # Regional Workers (價格推送服務)
│ │ ├── src/
│ │ │ ├── routes/ # API 路由
│ │ │ │ └── ws.ts                 # WebSocket 連接入口點
│ │ │ ├── services/ # 業務邏輯
│ │ │ │ ├── connection/
│ │ │ │ │ ├── wsManager.ts      # WebSocket 連接管理器
│ │ │ │ │ └── sessionStore.ts   # 用戶會話存儲
│ │ │ │ ├── subscription/
│ │ │ │ │ ├── assetRegistry.ts  # 用戶資產註冊管理
│ │ │ │ │ └── priceHub.ts       # 價格訂閱與分發中心
│ │ │ │ └── do/
│ │ │ │ │ ├── doClient.ts       # DO 通訊客戶端
│ │ │ │ │ └── messageQueue.ts    # DO 消息佇列處理
│ │ │ │ └── ws/ # WebSocket 處理
│ │ │ │ │ ├── handlers/
│ │ │ │ │ │ ├── assetHandler.ts   # 處理資產相關 WS 消息
│ │ │ │ │ │ ├── authHandler.ts    # 處理認證相關 WS 消息
│ │ │ │ │ │ └── priceHandler.ts   # 處理價格相關 WS 消息
│ │ │ │ │ └── protocols/
│ │ │ │ │ │ └── messageTypes.ts    # WebSocket 消息類型定義
│ │ │ │ └── utils/ # 工具函數
│ │ │ │ │ ├── auth.ts               # 認證相關工具
│ │ │ │ │ ├── cache.ts             # 快取處理工具
│ │ │ │ │ └── validation.ts        # 數據驗證工具
│ │ ├── **tests**/ # Regional Workers 測試
│ │ └── wrangler.toml
│ │
│ └── price-service/ # Price Service DO
│ ├── src/
│ │ ├── services/ # 主要邏輯
│ │ └── utils/ # 工具函數
│ ├── **tests**/ # 測試
│ └── wrangler.toml
│
└── shared/ # 共用程式碼
├── constants/ # 常數定義
├── types/ # TypeScript 型別
└── utils/ # 共用工具函數
