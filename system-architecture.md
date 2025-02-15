flowchart TB
 subgraph s1["Supabase資源"]
        AUTH["Supabase Auth"]
        SPDB["Supabase Database(用戶設定/資產清單)"]
  end
 subgraph s2["Cloudflare資源"]
        RW["Regional Workers(地區接入層)"]
        DO["Price Service DO(價格協調器)"]
        WC["Cloudflare Cache Api(地區價格快取)"]
        n1["Cloudflare Cache Api(來源價格快取)"]
  end
 subgraph s5["價格查詢流程"]
    direction LR
        P1["接收價格請求"]
        P2["檢查Worker Cache"]
        P3["Cache命中返回"]
        P4["通知價格查詢服務"]
        P5["更新價格服務Cache"]
  end
    X["用戶/前端"] -- 帶Token請求資產 --> RW
    RW -- 訂閱價格更新 --> DO
    DO -- 批次查詢 --> EXT["外部價格 API(12Data)"]
    DO -- 推送更新 --> RW
    RW -- ws推送到用戶 --> X
    RW <-- 讀寫快取 --> WC
    P1 --> P2
    P2 --> P3
    P2 -- Cache未命中 --> P4
    P4 --> P5
    P5 --> P3
    AUTH --> SPDB
    AUTH <--> RW
    DO --> n1

     AUTH:::supabase
     SPDB:::supabase
     RW:::cloudflare
     DO:::cloudflare