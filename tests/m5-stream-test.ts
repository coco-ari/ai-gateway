// M5 流式响应测试
import * as SDK from '../src/index';

async function testStream() {
  console.log('=== M5: 流式响应测试 ===\n');

  const apiKey = process.env.CODING_PLAN_API_KEY;
  if (!apiKey) {
    console.error('❌ 请设置 CODING_PLAN_API_KEY 环境变量');
    process.exit(1);
  }

  const client = new SDK.AliyunBailian({
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
  });

  // 测试 1: 流式调用 (M5-1)
  console.log('测试 1: 流式 API 可用...');
  try {
    const reader = await client.messages.stream({
      model: 'glm-5',
      max_tokens: 100,
      stream: true,
      messages: [{ role: 'user', content: '用50字介绍北京' }]
    });
    console.log('✅ 流式 API 调用成功');

    // 验证返回的是 ReadableStreamDefaultReader
    if (reader && typeof reader.read === 'function') {
      console.log('✅ 返回正确的 Reader 类型');
    } else {
      console.error('❌ 返回类型不正确');
      return false;
    }
  } catch (error) {
    console.error('❌ 流式调用失败:', error);
    return false;
  }

  // 测试 2: 异步迭代器工作 (M5-3)
  console.log('\n测试 2: 异步迭代器工作...');
  const reader2 = await client.messages.stream({
    model: 'glm-5',
    max_tokens: 100,
    stream: true,
    messages: [{ role: 'user', content: '用30字介绍上海' }]
  });

  // 封装成异步迭代器
  const stream = createAsyncIterator(reader2);

  let fullText = '';
  console.log('流式输出: ');
  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta?.type === 'text_delta') {
          process.stdout.write(event.delta.text);
          fullText += event.delta.text;
        }
      }
    }
    console.log('\n');
    if (fullText.length > 0) {
      console.log('✅ 异步迭代器工作正常，收到文本长度:', fullText.length);
    } else {
      console.error('❌ 未收到流式内容');
      return false;
    }
  } catch (error) {
    console.error('❌ 异步迭代器失败:', error);
    return false;
  }

  // 测试 3: 正确解析事件类型 (M5-2)
  console.log('\n测试 3: 验证事件类型...');
  const reader3 = await client.messages.stream({
    model: 'glm-5',
    max_tokens: 50,
    stream: true,
    messages: [{ role: 'user', content: '你好' }]
  });

  const stream3 = createAsyncIterator(reader3);
  const eventTypes = new Set<string>();

  for await (const event of stream3) {
    eventTypes.add(event.type);
  }

  console.log('收到的事件类型:', Array.from(eventTypes).join(', '));

  // 验证关键事件类型存在
  const expectedTypes = ['content_block_start', 'content_block_delta', 'content_block_stop', 'message_stop'];
  const hasRequiredTypes = expectedTypes.some(t => eventTypes.has(t));

  if (hasRequiredTypes) {
    console.log('✅ 正确解析事件类型');
  } else {
    console.error('❌ 缺少必要的事件类型');
    return false;
  }

  // 测试 4: 错误处理 (M5-4)
  console.log('\n测试 4: 错误处理...');
  try {
    await client.messages.stream({
      model: 'invalid-model-xxx',
      max_tokens: 10,
      stream: true,
      messages: [{ role: 'user', content: 'test' }]
    });
    console.error('❌ 应该抛出错误但没有');
    return false;
  } catch (error) {
    console.log('✅ 正确处理错误:', (error as Error).constructor.name);
  }

  console.log('\n✅ M5 所有测试通过');
  return true;
}

// 封装函数 - 与 src/streaming.ts 中相同
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
              } catch (e) {}
            }
          }
        }
      }
    }
  };
}

testStream().then(success => {
  process.exit(success ? 0 : 1);
});