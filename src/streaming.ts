import * as SDK from './index';


const apiKey = process.env.CODING_PLAN_API_KEY!;
const sdk = new SDK.AliyunBailian({    
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
});

sdk.messages.create(({
      model: 'glm-5',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    }));