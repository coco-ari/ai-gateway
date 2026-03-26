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
        model: 'claude-3-5-sonnet-20241022',
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

    const data = await response.json() as any;
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