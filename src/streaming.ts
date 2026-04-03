import * as SDK from './index';



const apiKey = process.env.CODING_PLAN_API_KEY!;
const sdk = new SDK.AliyunBailian({    
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
});


async function main() {
    const reader = await sdk.messages.stream({
      model: 'glm-5',
      max_tokens: 500,
      stream: true,
      messages: [{ role: 'user', content: '描述一下北京' }]
    });

    // 封装成异步迭代器
    const stream = createAsyncIterator(reader);

    // 简洁使用
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta?.type === 'text_delta') {
          process.stdout.write(event.delta.text);
        }
      }
    }
  }

  // 封装函数
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

main().catch(console.error);


