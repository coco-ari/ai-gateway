import * as SDK from './index';



const apiKey = process.env.CODING_PLAN_API_KEY!;
const sdk = new SDK.AliyunBailian({    
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
});

const reader = sdk.messages.stream(({
      model: 'glm-5',
      max_tokens: 50,
      stream : true,
      messages: [{ role: 'user', content: '描述一下北京' }]
    }));

    reader.then( async (reader) => {
        const decoder = new TextDecoder();                                                                                                                                                          
        let buffer = ''; 
          // 读取流
        while (true) {
            const { done, value } = await reader.read();
            if (done) break; 
            buffer += decoder.decode(value, { stream: true });                                                                                                                                      
            // 解析 SSE 格式，处理数据...                                                                                                                                                           
            console.log(buffer);  // 至少要输出   
        }
    })


