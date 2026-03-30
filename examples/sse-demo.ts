// 流式响应基础示例
// SSE (Server-Sent Events) 协议演示

const API_KEY = process.env.CODING_PLAN_API_KEY!;
const BASE_URL = 'https://coding.dashscope.aliyuncs.com/apps/anthropic';

async function testStream() {
  console.log('=== SSE 流式响应测试 ===\n');

  // 发送流式请求
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
      stream: true,  // 开启流式响应
      messages: [{ role: 'user', content: '用50字介绍北京' }]
    })
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  // 获取响应流
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  let buffer = '';  // 缓存未完成的行
  let currentEventType = '';  // 当前事件类型

  console.log('流式输出:\n');

  // 读取流
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      console.log('\n\n流结束');
      break;
    }

    // 解码数据块
    buffer += decoder.decode(value, { stream: true });

    // 按行分割处理
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';  // 保留未完成的行

    for (const line of lines) {
      // SSE 格式：
      // event: message_start
      // data: {"type":"message_start",...}

      if (line.startsWith('event:')) {
        currentEventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const data = line.slice(5).trim();

        if (data === '[DONE]') {
          console.log('\n收到结束标记');
          continue;
        }

        try {
          const event = JSON.parse(data);
          handleEvent(event, currentEventType);
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// 处理不同类型的事件
function handleEvent(event: any, eventType: string) {
  switch (event.type) {
    case 'message_start':
      console.log(`[消息开始] ID: ${event.message?.id}`);
      break;

    case 'content_block_start':
      console.log(`[内容块开始] index: ${event.index}, type: ${event.content_block?.type}`);
      break;

    case 'content_block_delta':
      // 只输出 text_delta（实际文本），跳过 thinking_delta（思考过程）
      if (event.delta?.type === 'text_delta') {
        process.stdout.write(event.delta.text);
      }
      break;

    case 'content_block_stop':
      // 内容块结束
      break;

    case 'message_delta':
      console.log(`\n[消息更新] stop_reason: ${event.delta?.stop_reason}`);
      break;

    case 'message_stop':
      console.log('\n[消息结束]');
      break;

    case 'ping':
      // ping 事件，忽略
      break;

    default:
      // 其他事件类型
      if (event.type) {
        console.log(`[事件: ${event.type}]`);
      }
  }
}

testStream().catch(console.error);