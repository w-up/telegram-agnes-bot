import { Bot } from "grammy";
import { limit } from "@grammyjs/ratelimiter";
import OpenAI from "openai";
import "dotenv/config";

// 初始化 Telegram Bot
const bot = new Bot(process.env.BOT_TOKEN!);

// 初始化 AIHub 客户端（OpenAI 兼容）
const ai = new OpenAI({
  apiKey: process.env.AIHUB_API_KEY!,
  baseURL: process.env.AIHUB_BASE_URL || "http://aihub.lingrendev.com:8080/v1",
});

// 用户上下文管理（简单内存存储，生产环境建议用 Redis）
const userContexts = new Map<number, Array<{ role: string; content: string }>>();

// /start 命令
bot.command("start", (ctx) => {
  ctx.reply(
    "👋 欢迎使用 Agnes AI Bot！\n\n" +
    "直接发送消息与我对话\n" +
    "/clear - 清空对话历史\n" +
    "/model - 查看当前模型"
  );
});

// /clear 清空上下文
bot.command("clear", (ctx) => {
  userContexts.delete(ctx.from!.id);
  ctx.reply("✅ 对话历史已清空");
});

// /model 查看当前模型
bot.command("model", (ctx) => {
  const model = process.env.AIHUB_MODEL || "gpt-5.5";
  ctx.reply(`🤖 当前模型: ${model}`);
});

// 处理文本消息
// 速率限制：每个用户每分钟最多 5 条（仅对话消息计数，命令不受限）
bot.on(
  "message:text",
  limit({
    // 时间窗口 60 秒
    timeFrame: 60_000,
    // 窗口内最多 5 次
    limit: 5,
    // 按 Telegram 用户 ID 独立计数
    keyGenerator: (ctx) => ctx.from?.id.toString(),
    // 超限时的提示（同一窗口内只提示一次，避免刷屏）
    onLimitExceeded: async (ctx) => {
      await ctx.reply("⏳ 发送太频繁啦，每分钟最多 5 条消息，请稍后再试");
    },
  }),
  async (ctx) => {
    const userId = ctx.from.id;
    const userMessage = ctx.message.text;

    // 排除命令
    if (userMessage.startsWith("/")) return;

    // 发送"正在输入"状态
    await ctx.replyWithChatAction("typing");

    try {
      // 获取或初始化用户上下文
      let context = userContexts.get(userId) || [];

      // 添加用户消息
      context.push({ role: "user", content: userMessage });

      // 限制上下文长度（保留最近 10 条消息）
      if (context.length > 10) {
        context = context.slice(-10);
      }

      // 调用 AIHub API
      const response = await ai.chat.completions.create({
        model: process.env.AIHUB_MODEL || "gpt-5.5",
        messages: context as any,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiReply = response.choices[0]?.message?.content || "抱歉，我没有理解你的问题";

      // 保存 AI 回复到上下文
      context.push({ role: "assistant", content: aiReply });
      userContexts.set(userId, context);

      // 回复用户
      await ctx.reply(aiReply);
    } catch (error: any) {
      console.error("AI 调用失败:", error);
      await ctx.reply(
        `❌ 抱歉，处理失败：${error.message}\n\n` +
        `请稍后重试或联系管理员`
      );
    }
  }
);

// 错误处理
bot.catch((err) => {
  console.error("Bot 错误:", err);
});

// 启动 Bot
bot.start({
  onStart: () => console.log("✅ Agnes Bot 已启动"),
});
