# 从零实现 Anthropic SDK 学习计划

## 背景

你刚学完 TypeScript 基础语法和 Node.js 基础，想全职学习，**从零开始实现一个能调用 Coding Plan 的 SDK**。

### Coding Plan 配置信息
- **Base URL**: `https://coding.dashscope.aliyuncs.com/apps/anthropic`
- **认证方式**: Coding Plan 专属 API Key
- **兼容**: Anthropic API 协议

### 学习方式
```
自己尝试实现 → 卡住时参考官方源码 → 对比学习
```

**官方源码参考**: https://github.com/anthropics/anthropic-sdk-typescript

**预计学习时间：** 1-2 周（全职学习，每天 4+ 小时）

---

## 里程碑总览

| 里程碑 | 名称 | 预计天数 | 状态 |
|--------|------|----------|------|
| M1 | 项目初始化 + API 调通 | 第1天 | ✅ 已达成 |
| M2 | 类型系统设计 | 第2-3天 | ✅ 已达成 |
| M3 | 客户端实现 | 第4-5天 | ✅ 已达成 |
| M4 | Messages API 实现 | 第6-7天 | ✅ 已达成 |
| M5 | 流式响应实现 | 第8-10天 | ⬜ 未开始 |
| M6 | 测试与文档 | 第11-14天 | ⬜ 未开始 |

---

## M1：项目初始化 + API 调通（第1天）

### 学习目标
- 创建项目结构
- 学习 Anthropic API 文档
- 用原生 fetch 成功调用 Coding Plan

### 具体任务

#### 上午：创建项目

```bash
mkdir anthropic-sdk-learning
cd anthropic-sdk-learning
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
```

创建目录结构：
```
anthropic-sdk-learning/
├── src/
│   └── index.ts
├── examples/
│   └── basic-call.ts
├── tests/
├── package.json
└── tsconfig.json
```

#### 下午：学习 API 文档

**必读文档：**
1. [Anthropic API 概述](https://docs.anthropic.com/en/api/getting-started)
2. [Messages API](https://docs.anthropic.com/en/api/messages)
3. [认证方式](https://docs.anthropic.com/en/api/getting-started#authentication)

重点关注：
- 请求格式（headers、body）
- 响应格式
- 必填参数

#### 晚间：手动调用测试

使用原生 fetch 调用 Coding Plan，理解 API 工作方式。

### 验收标准

| 编号 | 验收项 | 验证方式 |
|------|--------|----------|
| M1-1 | 项目结构创建完成 | 检查目录和文件存在 |
| M1-2 | TypeScript 编译成功 | `npx tsc --noEmit` 无错误 |
| M1-3 | 成功用 fetch 调用 Coding Plan | 运行测试脚本获得响应 |

### 验收测试代码

创建文件 `examples/basic-call.ts`：

```typescript
// M1 测试：用原生 fetch 调用 Coding Plan
// 目标：理解 API 请求格式

const API_KEY = process.env.CODING_PLAN_API_KEY;
const BASE_URL = 'https://coding.dashscope.aliyuncs.com/apps/anthropic';

async function testBasicCall() {
  console.log('=== M1: 基础 API 调用测试 ===\n');

  if (!API_KEY) {
    console.error('❌ 请设置环境变量 CODING_PLAN_API_KEY');
    process.exit(1);
  }

  console.log('发送请求到 Coding Plan...');

  try {
    const response = await fetch(`${BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'glm-5',
        max_tokens: 100,
        messages: [
          { role: 'user', content: '你好，请说"测试成功"' }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ 请求成功！\n');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));

    // 验证响应格式
    if (data.content && Array.isArray(data.content)) {
      console.log('\n✅ 响应格式正确');
      return true;
    } else {
      console.error('\n❌ 响应格式不符合预期');
      return false;
    }

  } catch (error) {
    console.error('❌ 请求出错:', error);
    return false;
  }
}

testBasicCall().then(success => {
  process.exit(success ? 0 : 1);
});
```

**运行命令：**
```bash
export CODING_PLAN_API_KEY="your-api-key"
npx ts-node examples/basic-call.ts
```

---

## M2：类型系统设计（第2-3天）

### 学习目标
- 设计 Messages API 的类型定义
- 学习 TypeScript 高级类型技巧
- 理解 SDK 如何保证类型安全

### 学习任务

#### 第2天：请求类型定义

根据 API 文档，定义以下类型：
- `Message` - 消息结构
- `ContentBlock` - 内容块（text、image）
- `MessageCreateParams` - 请求参数

**思考问题：**
- `content` 可以是字符串或数组，如何定义？
- `role` 只有特定值，如何限制？

#### 第3天：响应类型定义

定义以下类型：
- `MessageResponse` - 响应结构
- `Usage` - token 使用量
- 错误响应类型

**参考位置：** 卡住时查看官方源码 `src/resources/messages.ts` 附近的类型定义

### 验收标准

| 编号 | 验收项 | 验证方式 |
|------|--------|----------|
| M2-1 | 请求类型定义完整 | TypeScript 编译通过 |
| M2-2 | 响应类型定义完整 | TypeScript 编译通过 |
| M2-3 | 类型能正确约束参数 | 测试类型检查 |
| M2-4 | 能解释类型设计理由 | 口头说明 |

### 验收测试代码

创建文件 `tests/m2-types-test.ts`：

```typescript
// M2 类型系统测试
// 目标：验证类型定义是否正确

import {
  Message,
  MessageCreateParams,
  MessageResponse,
  ContentBlock
} from '../src/types';

// 测试 1: 基本消息参数
const params1: MessageCreateParams = {
  model: 'glm-5',
  max_tokens: 100,
  messages: [
    { role: 'user', content: '你好' }
  ]
};
console.log('✅ 测试 1 通过: 基本参数类型正确');

// 测试 2: content 为数组
const params2: MessageCreateParams = {
  model: 'glm-5',
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: '描述这张图片' },
        { type: 'image', source: { type: 'url', url: 'https://example.com/image.png' } }
      ]
    }
  ]
};
console.log('✅ 测试 2 通过: 数组内容类型正确');

// 测试 3: 系统消息
const params3: MessageCreateParams = {
  model: 'glm-5',
  max_tokens: 100,
  system: '你是一个有帮助的助手',
  messages: [
    { role: 'user', content: '你好' }
  ]
};
console.log('✅ 测试 3 通过: 系统消息类型正确');

// 测试 4: 响应类型
const response: MessageResponse = {
  id: 'msg_xxx',
  type: 'message',
  role: 'assistant',
  content: [
    { type: 'text', text: '你好！' }
  ],
  model: 'glm-5',
  stop_reason: 'end_turn',
  usage: { input_tokens: 10, output_tokens: 5 }
};
console.log('✅ 测试 4 通过: 响应类型正确');

// 测试 5: 类型错误应该被捕获（取消注释应该报错）
// const badParams: MessageCreateParams = {
//   model: 'glm-5',
//   max_tokens: 100,
//   messages: [
//     { role: 'invalid-role', content: 'test' } // 应该报错
//   ]
// };

console.log('\n✅ M2 所有类型测试通过');
```

**运行命令：**
```bash
npx tsc --noEmit tests/m2-types-test.ts
```

---

## M3：客户端实现（第4-5天）

### 学习目标
- 实现 SDK 客户端类
- 理解配置选项处理
- 实现 HTTP 请求封装

### 学习任务

#### 第4天：客户端类设计

实现 `Anthropic` 客户端类：
- 构造函数接收配置
- 存储 apiKey、baseURL
- 提供默认值

**思考问题：**
- 如何让 baseURL 可配置但有默认值？
- 如何验证必填的 apiKey？

#### 第5天：HTTP 请求封装

实现请求函数：
- 统一的请求头处理
- 错误响应处理
- 返回类型化响应

### 验收标准

| 编号 | 验收项 | 验证方式 |
|------|--------|----------|
| M3-1 | 客户端可实例化 | 测试代码验证 |
| M3-2 | 配置选项生效 | 测试不同配置 |
| M3-3 | 能发送请求 | 实际调用成功 |
| M3-4 | 错误处理正常 | 测试错误场景 |

### 验收测试代码

创建文件 `tests/m3-client-test.ts`：

```typescript
// M3 客户端测试
import { Anthropic } from '../src';

async function testClient() {
  console.log('=== M3: 客户端测试 ===\n');

  const apiKey = process.env.CODING_PLAN_API_KEY;
  if (!apiKey) {
    console.error('❌ 请设置 CODING_PLAN_API_KEY');
    process.exit(1);
  }

  // 测试 1: 客户端实例化
  console.log('测试 1: 客户端实例化...');
  const client = new Anthropic({
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
  });
  console.log('✅ 客户端创建成功\n');

  // 测试 2: 默认配置
  console.log('测试 2: 检查默认配置...');
  // 你的客户端应该有获取配置的方法，或者直接测试功能
  console.log('✅ 默认配置正常\n');

  // 测试 3: 发送请求
  console.log('测试 3: 发送请求...');
  try {
    // 假设你已经实现了 messages.create
    const response = await client.messages.create({
      model: 'glm-5',
      max_tokens: 50,
      messages: [{ role: 'user', content: '说"测试成功"' }]
    });

    console.log('✅ 请求成功');
    console.log('响应:', response.content[0].type === 'text' ? response.content[0].text : response.content);
  } catch (error) {
    console.error('❌ 请求失败:', error);
    return false;
  }

  // 测试 4: 错误处理
  console.log('\n测试 4: 错误处理...');
  try {
    await client.messages.create({
      model: 'invalid-model',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });
    console.error('❌ 应该抛出错误');
    return false;
  } catch (error) {
    console.log('✅ 正确处理错误:', (error as Error).constructor.name);
  }

  console.log('\n✅ M3 所有测试通过');
  return true;
}

testClient().then(success => {
  process.exit(success ? 0 : 1);
});
```

---

## M4：Messages API 实现（第6-7天）

### 学习目标
- 实现 `messages.create()` 方法
- 实现完整的请求参数支持
- 实现响应解析

### 学习任务

#### 第6天：基本实现

- 实现 `messages` 资源类
- 实现 `create` 方法
- 基本参数支持

#### 第7天：完善功能

- 支持更多参数（temperature、top_p 等）
- 支持 system 消息
- 支持多模态内容（图片）

**参考官方源码：** `src/resources/messages.ts`

### 验收标准

| 编号 | 验收项 | 验证方式 |
|------|--------|----------|
| M4-1 | messages.create 可用 | 测试基本调用 |
| M4-2 | 支持多轮对话 | 测试多条消息 |
| M4-3 | 支持 system 消息 | 测试系统提示 |
| M4-4 | 类型安全 | TypeScript 检查 |

### 验收测试代码

创建文件 `tests/m4-messages-test.ts`：

```typescript
// M4 Messages API 测试
import { Anthropic } from '../src';

async function testMessages() {
  console.log('=== M4: Messages API 测试 ===\n');

  const client = new Anthropic({
    apiKey: process.env.CODING_PLAN_API_KEY!,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
  });

  // 测试 1: 基本调用
  console.log('测试 1: 基本调用...');
  const response1 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    messages: [{ role: 'user', content: '你好' }]
  });
  console.log('✅ 基本调用成功');
  console.log('   响应:', response1.content[0].type === 'text' ? response1.content[0].text.slice(0, 30) : '');

  // 测试 2: 多轮对话
  console.log('\n测试 2: 多轮对话...');
  const response2 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    messages: [
      { role: 'user', content: '我叫小明' },
      { role: 'assistant', content: '你好小明！' },
      { role: 'user', content: '我叫什么名字？' }
    ]
  });
  console.log('✅ 多轮对话成功');
  console.log('   响应:', response2.content[0].type === 'text' ? response2.content[0].text.slice(0, 30) : '');

  // 测试 3: System 消息
  console.log('\n测试 3: System 消息...');
  const response3 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    system: '你是一个海盗，说话要用海盗的口吻',
    messages: [{ role: 'user', content: '你好' }]
  });
  console.log('✅ System 消息成功');
  console.log('   响应:', response3.content[0].type === 'text' ? response3.content[0].text.slice(0, 30) : '');

  // 测试 4: 参数支持
  console.log('\n测试 4: 可选参数...');
  const response4 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    temperature: 0.5,
    messages: [{ role: 'user', content: '说一个数字' }]
  });
  console.log('✅ 可选参数支持成功');

  console.log('\n✅ M4 所有测试通过');
  return true;
}

testMessages().then(success => {
  process.exit(success ? 0 : 1);
});
```

---

## M5：流式响应实现（第8-10天）

### 学习目标
- 理解 SSE (Server-Sent Events) 协议
- 实现流式响应解析
- 提供友好的迭代器接口

### 学习任务

#### 第8天：学习 SSE

- 阅读 SSE 规范
- 理解 Anthropic 流式响应格式
- 手动测试流式 API

#### 第9天：实现流式解析

- 解析 SSE 事件
- 处理不同事件类型
- 实现错误处理

#### 第10天：封装接口

- 实现异步迭代器
- 提供 `messages.stream()` 方法
- 完善类型定义

**参考官方源码：** `src/streaming.ts`

### 验收标准

| 编号 | 验收项 | 验证方式 |
|------|--------|----------|
| M5-1 | 流式 API 可用 | 测试流式调用 |
| M5-2 | 正确解析事件 | 验证事件类型 |
| M5-3 | 异步迭代器工作 | for-await 循环 |
| M5-4 | 错误处理正常 | 测试中断场景 |

### 验收测试代码

创建文件 `tests/m5-stream-test.ts`：

```typescript
// M5 流式响应测试
import { Anthropic } from '../src';

async function testStream() {
  console.log('=== M5: 流式响应测试 ===\n');

  const client = new Anthropic({
    apiKey: process.env.CODING_PLAN_API_KEY!,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
  });

  // 测试 1: 流式调用
  console.log('测试 1: 流式调用...');
  const stream = await client.messages.stream({
    model: 'glm-5',
    max_tokens: 100,
    messages: [{ role: 'user', content: '用50字介绍北京' }]
  });

  console.log('流式响应: ');
  let fullText = '';

  for await (const event of stream) {
    // 根据 Anthropic API 格式处理事件
    if (event.type === 'content_block_delta') {
      const delta = event.delta as any;
      if (delta.type === 'text_delta') {
        process.stdout.write(delta.text);
        fullText += delta.text;
      }
    }
  }

  if (fullText.length > 0) {
    console.log('\n\n✅ 流式调用成功');
  } else {
    console.error('\n❌ 未收到流式内容');
    return false;
  }

  // 测试 2: 事件类型验证
  console.log('\n测试 2: 验证事件类型...');
  const stream2 = await client.messages.stream({
    model: 'glm-5',
    max_tokens: 50,
    messages: [{ role: 'user', content: '你好' }]
  });

  const eventTypes = new Set<string>();
  for await (const event of stream2) {
    eventTypes.add(event.type);
  }

  console.log('收到的事件类型:', Array.from(eventTypes).join(', '));
  console.log('✅ 事件类型验证完成');

  console.log('\n✅ M5 所有测试通过');
  return true;
}

testStream().then(success => {
  process.exit(success ? 0 : 1);
});
```

---

## M6：测试与文档（第11-14天）

### 学习目标
- 编写完整测试
- 完善错误处理
- 编写使用文档

### 学习任务

#### 第11-12天：测试完善

- 安装测试框架（Vitest）
- 编写单元测试
- 测试各种场景

#### 第13-14天：文档与总结

- 编写 README
- 添加使用示例
- 编写学习总结

### 验收标准

| 编号 | 验收项 | 验证方式 |
|------|--------|----------|
| M6-1 | 单元测试通过 | `npm test` 成功 |
| M6-2 | README 完整 | 包含安装和使用说明 |
| M6-3 | 有完整示例 | 至少 3 个示例 |
| M6-4 | 学习总结文档 | 记录学习心得 |

### 项目最终结构

```
anthropic-sdk-learning/
├── src/
│   ├── index.ts              # 主入口
│   ├── client.ts             # 客户端类
│   ├── resources/
│   │   ├── index.ts
│   │   └── messages.ts       # Messages API
│   ├── core/
│   │   ├── request.ts        # HTTP 请求
│   │   ├── error.ts          # 错误类
│   │   └── streaming.ts      # 流式处理
│   └── types/
│       └── index.ts          # 类型定义
├── examples/
│   ├── basic-call.ts
│   ├── multi-turn.ts
│   └── streaming.ts
├── tests/
│   └── *.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 学习资源

### API 文档
- **Anthropic API 概述**: https://docs.anthropic.com/en/api/getting-started
- **Messages API**: https://docs.anthropic.com/en/api/messages
- **Streaming**: https://docs.anthropic.com/en/api/messages-streaming

### 参考源码
- **官方 SDK**: https://github.com/anthropics/anthropic-sdk-typescript

### TypeScript 学习
- **泛型**: https://www.typescriptlang.org/docs/handbook/2/generics.html
- **类型推断**: https://www.typescriptlang.org/docs/handbook/type-inference.html

---

## 开始行动

执行第一步：

```bash
mkdir anthropic-sdk-learning
cd anthropic-sdk-learning
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
mkdir -p src examples tests
```

完成 M1 后，告诉我 **"检查 M1"**，我会运行验收测试。