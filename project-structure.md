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
│ │ │ ├── services/ # 業務邏輯
│ │ │ ├── ws/ # WebSocket 處理
│ │ │ └── utils/ # 工具函數
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
