import * as SDK from './index';



const apiKey = process.env.CODING_PLAN_API_KEY!;
const sdk = new SDK.AliyunBailian({    
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
});


async function main() {
    const reader =  await sdk.messages.stream(({
      model: 'glm-5',
      max_tokens: 50,
      stream : true,
      messages: [{ role: 'user', content: '描述一下北京' }]
    }));
   await processStream(reader);
}


async function processStream(reader: ReadableStreamDefaultReader) {
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        console.log(buffer);
    }
}

main().catch(console.error);


