# 开奖网部署指南

## Render 环境变数设置

请在 Render Dashboard 中设置以下环境变数：

### 必须设置的变数：

1. **GAME_API_URL**
   ```
   GAME_API_URL=https://bet-game-vcje.onrender.com
   ```

2. **DATABASE_URL**
   ```
   DATABASE_URL=postgresql://fsracing_user:gKr7pS8Kg48MknKwQirSPuNiRIpvLXhB@dpg-ct5t88lds78s73co2gdg-a.oregon-postgres.render.com/fsracing
   ```

## 设置步骤：

1. 登入 Render Dashboard
2. 找到您的开奖网服务 (racing10-lottery)
3. 点击 "Environment" 标签
4. 点击 "Add Environment Variable"
5. 添加上述变数
6. 储存后服务会自动重新部署

## 验证部署：

部署完成后，访问以下 URL 确认 API 正常运作：
- https://racing10-lottery.onrender.com/api/game-state

应该看到类似以下的响应：
```json
{
  "success": true,
  "data": {
    "current_period": "20250118XXX",
    "countdown_seconds": XX,
    "last_result": [1,2,3,4,5,6,7,8,9,10],
    "status": "betting",
    "server_time": "2025-01-18T...",
    "next_draw_time": "2025-01-18T..."
  }
}
```

## 故障排除：

如果仍然无法同步：
1. 检查主游戏是否正常运行：https://bet-game-vcje.onrender.com
2. 确认环境变数已正确设置
3. 查看 Render 日志中的错误讯息