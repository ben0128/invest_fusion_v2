assets-management/
├── .env.example                # 環境變數範例
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json               # TypeScript 配置
│
├── apps/                       
│   └── web/                    # 前端應用 (Next.js)
│       ├── app/                # App Router
│       ├── components/         # React 元件
│       ├── hooks/              # Custom Hooks
│       ├── utils/              # 工具函數
│       └── __tests__/          # 前端測試
│
├── supabase/                   # Supabase 相關
│   ├── functions/              # Edge Functions
│   │   └── auth/               # 認證相關函數
│   └── migrations/             # 資料庫遷移
│
├── workers/                    # Cloudflare Workers
│   ├── regional/               # Regional Workers (價格推送服務)
│   │   ├── src/
│   │   │   ├── routes/         # API 路由
│   │   │   ├── services/       # 業務邏輯
│   │   │   ├── ws/             # WebSocket 處理
│   │   │   └── utils/          # 工具函數
│   │   ├── __tests__/          # Regional Workers 測試
│   │   └── wrangler.toml
│   │
│   └── price-coordinator/   # Price Coordinator DO
│       ├── src/
│       │   ├── services/       # 快取邏輯
│       │   └── utils/          # 工具函數
│       ├── __tests__/          # 快取服務測試
│       └── wrangler.toml
│
└── shared/              # 共用程式碼
    ├── constants/       # 常數定義
    ├── types/          # TypeScript 型別
    └── utils/          # 共用工具函數