/**
 * Tool Calling 基础示例
 * 使用自己实现的 SDK（非流式请求）
 */

import 'dotenv/config';
import { AliyunBailian } from './client';
import * as Types from './types';

// 创建客户端
const client = new AliyunBailian({
    apiKey: process.env.CODING_PLAN_API_KEY || '',
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
});

// 定义工具
const tools: Types.ToolDefinition[] = [
    {
        name: 'get_weather',
        description: '获取指定城市的天气信息',
        input_schema: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: '城市名称，如"北京"、"上海"'
                }
            },
            required: ['city']
        }
    },
    {
        name: 'calculate',
        description: '执行数学计算',
        input_schema: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: '数学表达式，如"2+2"、"15*3"'
                }
            },
            required: ['expression']
        }
    },
    {
        name: 'get_weight',
        description: '获取实时体重',
        input_schema: {
            type: 'object' as const,
            properties: {},
            required: [],
        },
    }

];

// 工具执行函数
function executeTool(name: string, input: Record<string, unknown>): string {
    switch (name) {
        case 'get_weather': {
            const city = input.city as string;
            // 模拟天气数据
            const weather: Record<string, string> = {
                '北京': '晴天，温度 15°C，空气质量良好',
                '上海': '多云，温度 18°C，有轻微雾霾',
                '广州': '小雨，温度 22°C，湿度较高'
            };
            return weather[city] || `未找到 ${city} 的天气信息`;
        }
        case 'calculate': {
            const expr = input.expression as string;
            try {
                // 安全起见，只允许数字和基本运算符
                if (!/^[\d\s+\-*/.()]+$/.test(expr)) {
                    return '无效的表达式';
                }
                const result = eval(expr);
                return `计算结果: ${result}`;
            } catch {
                return '计算错误';
            }
        }
        case 'get_weight': {
            const weight = input.weight as string;
            try {
                // 注意：实际应用中不要使用 eval，这里仅作演示
                // 安全的替代方案：使用 math.js 库
                const result = 60;
                return `实时体重: ${result}`;
            } catch {
                return `实时体重获取错误 "${weight}"`;
            }
        }
        default:
            return `未知工具: ${name}`;
    }
}

async function main() {
    //console.log('用户问题: 北京今天天气怎么样？如果温度是15度，那15*2是多少？\n');

    const messages: Types.Message[] = [
        {
            role: 'user',
            content: '获取实时体重。北京今天天气怎么样？如果温度是15度，那15*2是多少？'
        }
    ];

    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
        iteration++;
        console.log(`=== 第 ${iteration} 轮 ===`);

        // 发送请求
        const response = await client.messages.create({
            model: 'glm-5',
            max_tokens: 1024,
            tools,
            messages
        });

        // 检查是否需要调用工具
        if (response.stop_reason === 'tool_use') {
            // 输出 AI 的文本回复
            for (const block of response.content) {
                if (block.type === 'text') {
                    console.log(block.text);
                }
            }

            console.log('\n🔧 执行工具调用...');

            // 收集工具结果
            const toolResults: Types.ContentBlock[] = [];

            for (const block of response.content) {
                if (block.type === 'tool_use') {
                    console.log(`   工具: ${block.name}`);
                    console.log(`   参数: ${JSON.stringify(block.input)}`);

                    const result = executeTool(block.name, block.input);
                    console.log(`   结果: ${result}`);

                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: block.id,
                        content: result
                    });
                }
            }

            // 添加 AI 回复和工具结果到消息历史
            messages.push({
                role: 'assistant',
                content: response.content
            });
            messages.push({
                role: 'user',
                content: toolResults
            });

        } else if (response.stop_reason === 'end_turn') {
            // 任务完成，输出最终回答
            for (const block of response.content) {
                if (block.type === 'text') {
                    console.log(block.text);
                }
            }
            console.log('\n✅ 任务完成');
            break;
        }
    }

    if (iteration >= maxIterations) {
        console.log('\n🤖 最终回答:');
        console.log('达到最大迭代次数，任务未完成');
    }
}

main().catch(console.error);