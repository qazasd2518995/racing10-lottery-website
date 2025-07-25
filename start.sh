#!/bin/bash

# 设置 Node.js 记忆体限制为 512MB
export NODE_OPTIONS="--max-old-space-size=512"

# 设置端口（Render 会提供 PORT 环境变数）
export PORT=${PORT:-10000}

# 检查是否存在 standalone 伺服器
if [ -f ".next/standalone/server.js" ]; then
    echo "Starting with standalone server..."
    # 复制静态文件到 standalone 目录（如果需要）
    if [ -d ".next/static" ] && [ -d ".next/standalone/.next" ]; then
        cp -r .next/static .next/standalone/.next/
    fi
    # 复制 public 文件到 standalone 目录（如果需要）
    if [ -d "public" ] && [ ! -d ".next/standalone/public" ]; then
        cp -r public .next/standalone/
    fi
    # 使用 standalone 模式启动
    node .next/standalone/server.js
else
    echo "Standalone server not found, using regular next start..."
    # 使用常规方式启动
    exec npm run start:regular
fi