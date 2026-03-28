# Anthropic SDK Learning

从零开始实现一个 Anthropic SDK，学习 TypeScript SDK 设计模式。

## 背景

刚学完 TypeScript 基础语法和 Node.js 基础，通过从零实现一个能调用阿里云百炼 Coding Plan 的 SDK 来深入理解：

- SDK 的设计模式和架构
- TypeScript 高级类型技巧
- HTTP 请求封装和错误处理
- 流式响应（SSE）处理

## 进度

| 里程碑 | 名称 | 状态 |
|--------|------|:----:|
| M1 | 项目初始化 + API 调通 | ✅ |
| M2 | 类型系统设计 | ✅ |
| M3 | 客户端实现 | 🔄 |
| M4 | Messages API 实现 | ⬜ |
| M5 | 流式响应实现 | ⬜ |
| M6 | 测试与文档 | ⬜ |

## 项目结构

```
ai-gateway/
├── src/
│   ├── index.ts              # 主入口
│   ├── client.ts             # Anthropic 客户端类
│   ├── types/
│   │   └── index.ts          # 类型定义
│   ├── resources/
│   │   └── messages.ts       # Messages API
│   └── core/
│       ├── request.ts        # HTTP 请求封装
│       └── error.ts          # 错误类定义
├── tests/
│   ├── m1-basic-call-test.ts
│   ├── m2-types-test.ts
│   └── m3-client-test.ts
├── examples/                 # 使用示例（M3 完成后添加）
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── LEARNING_PLAN.md
```

## 安装

```bash
npm install
```

## 使用

```bash
# 设置 API Key
export CODING_PLAN_API_KEY="your-api-key"

# 运行测试
npx ts-node tests/m1-basic-call-test.ts
npx ts-node tests/m2-types-test.ts
npx ts-node tests/m3-client-test.ts
```

## API

### Anthropic 客户端

```typescript
import { Anthropic } from './src';

const client = new Anthropic({
  apiKey: process.env.CODING_PLAN_API_KEY,
  baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
});

// 创建消息
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  messages: [{ role: 'user', content: '你好' }]
});
```

## 类型定义

```typescript
// 消息结构
interface Message {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

// 内容块
type ContentBlock = TextBlock | ImageBlock;

interface TextBlock {
  type: 'text';
  text: string;
}

interface ImageBlock {
  type: 'image';
  source: ImageSource;
}

// 请求参数
interface MessageCreateParams {
  model: string;
  max_tokens: number;
  messages: Message[];
  system?: string;
  temperature?: number;
  // ...
}

// 响应
interface MessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ContentBlock[];
  model: string;
  stop_reason: StopReason | null;
  usage: Usage;
}
```

## 学习资源

- [Anthropic API 文档](https://docs.anthropic.com/en/api/getting-started)
- [Messages API](https://docs.anthropic.com/en/api/messages)
- [官方 SDK 源码](https://github.com/anthropics/anthropic-sdk-typescript)

## 许可证

ISC