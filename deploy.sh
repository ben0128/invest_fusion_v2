#!/bin/bash

# 確保環境變數存在
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN is not set"
    exit 1
fi

# 建置專案
echo "Building project..."
bun run build:all

# 部署 Workers
echo "Deploying Workers..."
bun run deploy:all

echo "Deployment completed!" 