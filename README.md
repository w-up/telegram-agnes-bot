# Telegram Agnes AI Bot

基于 Agnes AI 大模型的 Telegram 自动回复机器人。

## 功能特性

- ✅ 接入 AIHub 的 Agnes 大模型
- ✅ 自动上下文管理（保留最近 10 条对话）
- ✅ 支持多用户并发对话
- ✅ 命令支持：`/start`、`/clear`、`/model`

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 填入：
- `BOT_TOKEN`: 从 [@BotFather](https://t.me/BotFather) 创建 Bot 获取
- `AIHUB_API_KEY`: AIHub API 密钥
- `AIHUB_MODEL`: 使用的模型（如 `gpt-5.5` 或 `agnes-2.0-flash`）

### 3. 启动开发服务

```bash
pnpm dev
```

## 部署到 Railway

### 快速部署

1. 推送代码到 GitHub
2. 访问 [Railway](https://railway.app)
3. 点击 **New Project** → **Deploy from GitHub**
4. 选择此仓库
5. 添加环境变量：
   - `BOT_TOKEN`
   - `AIHUB_API_KEY`
   - `AIHUB_BASE_URL`
   - `AIHUB_MODEL`
6. Railway 会自动运行 `pnpm start`

### 验证部署

在 Telegram 中找到你的 Bot，发送消息测试。

## 使用说明

- 直接发送消息与 AI 对话
- `/clear` - 清空对话历史
- `/model` - 查看当前使用的模型

## 技术栈

- **Grammy** - Telegram Bot 框架
- **OpenAI SDK** - 兼容 AIHub API
- **TypeScript** - 类型安全
- **Railway** - 免费托管

## 常见问题

**Q: Bot 不回复？**  
检查 Railway 日志，确认环境变量配置正确。

**Q: 如何切换模型？**  
修改环境变量 `AIHUB_MODEL`，重启服务。

**Q: 如何限制用户访问？**  
在代码中添加白名单检查：

```typescript
const ALLOWED_USERS = [123456789]; // 允许的用户 ID

bot.on("message:text", async (ctx) => {
  if (!ALLOWED_USERS.includes(ctx.from!.id)) {
    return ctx.reply("❌ 无权限访问");
  }
  // ... 原有逻辑
});
```

## License

MIT
