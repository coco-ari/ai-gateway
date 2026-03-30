// M4 Messages API 测试
import { AliyunBailian } from '../src';

async function testMessages() {
  console.log('=== M4: Messages API 测试 ===\n');

  const apiKey = process.env.CODING_PLAN_API_KEY;
  if (!apiKey) {
    console.error('❌ 请设置 CODING_PLAN_API_KEY');
    process.exit(1);
  }

  const client = new AliyunBailian({ apiKey });

  // 测试 1: 基本调用
  console.log('测试 1: 基本调用...');
  const response1 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    messages: [{ role: 'user', content: '你好' }]
  });
  console.log('✅ 基本调用成功');
  const text1 = response1.content[0].type === 'text' ? response1.content[0].text : '';
  console.log('   响应:', text1.slice(0, 30));

  // 测试 2: 多轮对话
  console.log('\n测试 2: 多轮对话...');
  const response2 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    messages: [
      { role: 'user', content: '我叫小明' },
      { role: 'assistant', content: '你好小明！' },
      { role: 'user', content: '我叫什么名字？' }
    ]
  });
  console.log('✅ 多轮对话成功');
  const text2 = response2.content[0].type === 'text' ? response2.content[0].text : '';
  console.log('   响应:', text2.slice(0, 30));

  // 测试 3: System 消息
  console.log('\n测试 3: System 消息...');
  const response3 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    system: '你是一个海盗，说话要用海盗的口吻',
    messages: [{ role: 'user', content: '你好' }]
  });
  console.log('✅ System 消息成功');
  const text3 = response3.content[0].type === 'text' ? response3.content[0].text : '';
  console.log('   响应:', text3.slice(0, 30));

  // 测试 4: 可选参数
  console.log('\n测试 4: 可选参数...');
  const response4 = await client.messages.create({
    model: 'glm-5',
    max_tokens: 50,
    temperature: 0.5,
    top_p: 0.9,
    messages: [{ role: 'user', content: '说一个数字' }]
  });
  console.log('✅ 可选参数支持成功');
  const text4 = response4.content[0].type === 'text' ? response4.content[0].text : '';
  console.log('   响应:', text4.slice(0, 30));

  console.log('\n✅ M4 所有测试通过');
  return true;
}

testMessages().then(success => {
  process.exit(success ? 0 : 1);
});