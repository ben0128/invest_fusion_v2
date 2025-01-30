flowchart TB
 subgraph s1["Firebase資源"]
        AUTH["Firebase Auth"]
        RTDB["Realtime Database(用戶設定/資產清單)"]
  end
 subgraph s2["Cloudflare資源"]
        RW["Regional Workers(地區接入層)"]
        DO["Price Service DO(價格協調器)"]
        WC["Worker Cache(價格/資產快取層)"]
  end
 subgraph s5["價格查詢流程"]
    direction LR
        P1["接收價格請求"]
        P2["檢查Worker Cache"]
        P3["Cache命中返回"]
        P4["通知DO查詢"]
        P5["更新Cache"]
  end
    X["用戶/前端"] -- 直接認證 --> AUTH
    AUTH -- 回傳 Token --> X
    X -- 帶Token請求資產 --> RW
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
    AUTH --> RTDB

     AUTH:::firebase
     RTDB:::firebase
     RW:::cloudflare
     DO:::cloudflare
