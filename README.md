# AliyunBailian SDK

从零实现的 Anthropic SDK 兼容客户端，用于调用阿里云百炼 Coding Plan API。

## 进度

| 里程碑 | 名称 | 状态 |
|--------|------|:----:|
| M1 | 项目初始化 + API 调通 | ✅ |
| M2 | 类型系统设计 | ✅ |
| M3 | 客户端实现 | ✅ |
| M4 | Messages API 实现 | ✅ |
| M5 | 流式响应实现 | ✅ |
| M6 | 测试与文档 | ✅ |

## 安装

```bash
npm install
```

## 快速开始

### 基础调用

```typescript
import { AliyunBailian } from './src';

const client = new AliyunBailian({
  apiKey: process.env.CODING_PLAN_API_KEY!
});

const response = await client.messages.create({
  model: 'glm-5',
  max_tokens: 100,
  messages: [{ role: 'user', content: '你好' }]
});

console.log(response.content[0].text);
```

### 流式响应

```typescript
const reader = await client.messages.stream({
  model: 'glm-5',
  max_tokens: 100,
  stream: true,
  messages: [{ role: 'user', content: '介绍北京' }]
});

// 使用异步迭代器处理流
const stream = createAsyncIterator(reader);

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    if (event.delta?.type === 'text_delta') {
      process.stdout.write(event.delta.text);
    }
  }
}

// 辅助函数
function createAsyncIterator(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = '';

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data !== '[DONE]') {
              try {
                yield JSON.parse(data);
              } catch {}
            }
          }
        }
      }
    }
  };
}
```

### 多轮对话

```typescript
const response = await client.messages.create({
  model: 'glm-5',
  max_tokens: 100,
  messages: [
    { role: 'user', content: '我叫小明' },
    { role: 'assistant', content: '你好小明！' },
    { role: 'user', content: '我叫什么名字？' }
  ]
});
```

### System 消息

```typescript
const response = await client.messages.create({
  model: 'glm-5',
  max_tokens: 100,
  system: '你是一个海盗，说话要用海盗的口吻',
  messages: [{ role: 'user', content: '你好' }]
});
```

## API

### `AliyunBailian`

客户端类。

```typescript
new AliyunBailian({
  apiKey: string,      // 必填
  baseURL?: string,    // 默认: https://coding.dashscope.aliyuncs.com/apps/anthropic
  version?: string     // 默认: 2023-06-01
})
```

### `messages.create(params)`

创建消息，返回完整响应。

```typescript
await client.messages.create({
  model: 'glm-5',          // 必填
  max_tokens: 100,         // 必填
  messages: [...],         // 必填
  system?: string,         // 系统提示词
  temperature?: number,    // 0-1
  top_p?: number,
  stop_sequences?: string[]
});
```

### `messages.stream(params)`

创建流式消息，返回 `ReadableStreamDefaultReader`。

```typescript
await client.messages.stream({
  model: 'glm-5',
  max_tokens: 100,
  stream: true,
  messages: [{ role: 'user', content: '...' }]
});
```

## 项目结构

```
src/
├── index.ts           # 主入口
├── client.ts          # 客户端类
├── types/
│   └── index.ts       # 类型定义
├── core/
│   ├── request.ts     # HTTP 请求封装
│   └── error.ts       # 错误处理
├── resources/
│   └── messages.ts    # Messages API
└── streaming.ts       # 流式响应示例
```

## 运行示例

```bash
# 设置环境变量
export CODING_PLAN_API_KEY="your-api-key"

# 运行验收测试
npx ts-node tests/m4-messages-test.ts
npx ts-node tests/m5-stream-test.ts

# 运行 SSE 演示
npx ts-node examples/sse-demo.ts
```

## 学习收获

通过本项目学到了：

1. **TypeScript 类型系统** - 泛型、联合类型、类型约束
2. **HTTP 请求封装** - Headers、错误处理、响应解析
3. **SSE 流式协议** - Server-Sent Events、行缓冲处理
4. **异步迭代器** - `[Symbol.asyncIterator]`、`yield`、`for await...of`
5. **SDK 设计模式** - 客户端类、资源类、请求器分离

## 学习资源

- [Anthropic API 文档](https://docs.anthropic.com/en/api/getting-started)
- [Messages API](https://docs.anthropic.com/en/api/messages)
- [官方 SDK 源码](https://github.com/anthropics/anthropic-sdk-typescript)

## 许可证

ISC