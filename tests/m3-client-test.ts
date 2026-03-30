// M3 客户端测试
import { AliyunBailian, AuthenticationError, NotFoundError } from '../src';

async function testClient() {
  console.log('=== M3: 客户端测试 ===\n');

  const apiKey = process.env.CODING_PLAN_API_KEY;
  if (!apiKey) {
    console.error('❌ 请设置 CODING_PLAN_API_KEY');
    process.exit(1);
  }

  // 测试 1: 客户端实例化
  console.log('测试 1: 客户端实例化...');
  const client = new AliyunBailian({
    apiKey,
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
  });
  console.log('✅ 客户端创建成功\n');

  // 测试 2: 发送请求
  console.log('测试 2: 发送请求...');
  try {
    const response = await client.messages.create({
      model: 'glm-5',
      max_tokens: 50,
      messages: [{ role: 'user', content: '说"测试成功"' }]
    });

    console.log('✅ 请求成功');
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('响应:', text.slice(0, 50));
  } catch (error) {
    console.error('❌ 请求失败:', error);
    return false;
  }

  // 测试 3: 错误处理
  console.log('\n测试 3: 错误处理...');
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

  // 测试 4: 无效 API Key
  console.log('\n测试 4: 无效 API Key...');
  try {
    const badClient = new AliyunBailian({
      apiKey: 'invalid-key',
      baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
    });
    await badClient.messages.create({
      model: 'glm-5',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });
    console.error('❌ 应该抛出认证错误');
    return false;
  } catch (error) {
    console.log('✅ 正确处理认证错误:', (error as Error).constructor.name);
  }

  console.log('\n✅ M3 所有测试通过');
  return true;
}

testClient().then(success => {
  process.exit(success ? 0 : 1);
});