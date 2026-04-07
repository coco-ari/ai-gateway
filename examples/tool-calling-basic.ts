/**
 * Tool Calling 入门示例
 *
 * 这个示例展示了 Tool Calling 的核心流程：
 * 1. 定义工具 (Tools)
 * 2. 发送请求给模型
 * 3. 模型决定是否调用工具
 * 4. 执行工具并将结果返回给模型
 * 5. 循环直到模型给出最终回复
 */

import { AliyunBailian, Types } from '../src';
type Message = Types.Message;
type ContentBlock = Types.ContentBlock;
type ToolUseBlock = Types.ToolUseBlock;
type ToolDefinition = Types.ToolDefinition;

// ============================================
// 第一步：定义工具
// ============================================

/**
 * 工具定义 - 告诉模型有哪些工具可用
 *
 * 每个 tool 包含：
 * - name: 工具名称
 * - description: 工具描述（模型会根据这个决定何时调用）
 * - input_schema: 输入参数的 JSON Schema
 */
const tools: ToolDefinition[] = [
  {
    name: 'get_weather',
    description: '获取指定城市的当前天气信息',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string' as const,
          description: '城市名称，如：北京、上海',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'calculate',
    description: '执行数学计算',
    input_schema: {
      type: 'object' as const,
      properties: {
        expression: {
          type: 'string' as const,
          description: '数学表达式，如：2 + 3 * 4',
        },
      },
      required: ['expression'],
    },
  },
];

// ============================================
// 第二步：实现工具函数
// ============================================

/**
 * 工具执行函数映射
 * key: 工具名称
 * value: 工具执行函数
 */
const toolHandlers: Record<string, (input: Record<string, unknown>) => string> = {
  get_weather: (input) => {
    const city = input.city as string;
    // 模拟天气数据（实际应用中会调用真实 API）
    const weatherData: Record<string, string> = {
      '北京': '晴天，温度 15°C，空气质量良好',
      '上海': '多云，温度 18°C，有轻微雾霾',
      '广州': '小雨，温度 22°C，湿度较高',
    };
    return weatherData[city] || `未找到 ${city} 的天气信息`;
  },

  calculate: (input) => {
    const expression = input.expression as string;
    try {
      // 注意：实际应用中不要使用 eval，这里仅作演示
      // 安全的替代方案：使用 math.js 库
      const result = Function(`"use strict"; return (${expression})`)();
      return `计算结果: ${result}`;
    } catch {
      return `计算错误: 无法计算 "${expression}"`;
    }
  },
};

// ============================================
// 第三步：实现 Agent 循环
// ============================================

/**
 * Tool Calling Agent
 *
 * 核心逻辑：
 * 1. 发送用户消息和可用工具给模型
 * 2. 如果模型返回工具调用，执行工具并将结果返回
 * 3. 重复直到模型给出最终文本回复
 */
async function runAgent(
  client: AliyunBailian,
  userMessage: string
): Promise<string> {
  // 消息历史
  const messages: Message[] = [
    { role: 'user', content: userMessage },
  ];

  console.log('\n=== 开始 Agent 循环 ===\n');

  while (true) {
    console.log('📤 发送请求给模型...');

    // 调用 API
    const response = await client.messages.create({
      model: 'glm-5',
      max_tokens: 1024,
      messages: messages,
      tools: tools,
    });

    console.log(`📥 模型响应: stop_reason = ${response.stop_reason}`);

    // 检查是否需要调用工具
    if (response.stop_reason === 'tool_use') {
      console.log('🔧 模型请求调用工具\n');

      // 提取所有工具调用
      const toolCalls = response.content.filter(
        (block): block is ToolUseBlock => block.type === 'tool_use'
      );

      // 执行每个工具调用
      const toolResults: ContentBlock[] = [];

      for (const toolCall of toolCalls) {
        console.log(`   调用工具: ${toolCall.name}`);
        console.log(`   参数: ${JSON.stringify(toolCall.input)}`);

        const handler = toolHandlers[toolCall.name];
        if (handler) {
          const result = handler(toolCall.input as Record<string, unknown>);
          console.log(`   结果: ${result}\n`);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: result,
          });
        }
      }

      // 将助手的工具调用加入历史
      messages.push({
        role: 'assistant',
        content: response.content,
      });

      // 将工具结果加入历史
      messages.push({
        role: 'user',
        content: toolResults,
      });

      // 继续循环，让模型处理工具结果
      continue;
    }

    // 模型给出了最终回复
    console.log('✅ 模型给出最终回复\n');

    const textContent = response.content.find(
      (block): block is { type: 'text'; text: string } => block.type === 'text'
    );

    return textContent?.text || '（无文本回复）';
  }
}

// ============================================
// 主函数
// ============================================

async function main() {
  // 初始化客户端
  const client = new AliyunBailian({
    apiKey: process.env.CODING_PLAN_API_KEY || 'your-api-key-here',
  });

  // 测试问题
  const question = '北京今天天气怎么样？如果温度是15度，那15*2是多少？';
  console.log(`用户问题: ${question}`);

  try {
    const answer = await runAgent(client, question);
    console.log(`\n🤖 最终回答:\n${answer}`);
  } catch (error) {
    console.error('错误:', error);
  }
}

// 运行示例
main();