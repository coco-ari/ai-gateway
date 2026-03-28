// M2 类型系统测试
// 目标：验证类型定义是否正确

import {
  Message,
  MessageCreateParams,
  MessageResponse,
  ContentBlock,
  TextBlock,
  ImageBlock,
  Usage,
  Role,
  ModelId,
  StopReason
} from '../src/types';

// 测试 1: 基本消息参数
const params1: MessageCreateParams = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  messages: [
    { role: 'user', content: '你好' }
  ]
};
console.log('✅ 测试 1 通过: 基本参数类型正确');

// 测试 2: content 为数组
const params2: MessageCreateParams = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: '描述这张图片' },
        { type: 'image', source: { type: 'url', url: 'https://example.com/image.png' } }
      ]
    }
  ]
};
console.log('✅ 测试 2 通过: 数组内容类型正确');

// 测试 3: 系统消息
const params3: MessageCreateParams = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  system: '你是一个有帮助的助手',
  messages: [
    { role: 'user', content: '你好' }
  ]
};
console.log('✅ 测试 3 通过: 系统消息类型正确');

// 测试 4: 响应类型
const response: MessageResponse = {
  id: 'msg_xxx',
  type: 'message',
  role: 'assistant',
  content: [
    { type: 'text', text: '你好！' }
  ],
  model: 'claude-3-5-sonnet-20241022',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 5 }
};
console.log('✅ 测试 4 通过: 响应类型正确');

// 测试 5: 多轮对话
const params5: MessageCreateParams = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  messages: [
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！有什么可以帮助你的？' },
    { role: 'user', content: '介绍一下 TypeScript' }
  ]
};
console.log('✅ 测试 5 通过: 多轮对话类型正确');

// 测试 6: 可选参数
const params6: MessageCreateParams = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  temperature: 0.5,
  top_p: 0.9,
  stop_sequences: ['END'],
  messages: [
    { role: 'user', content: '说一个数字' }
  ]
};
console.log('✅ 测试 6 通过: 可选参数类型正确');

// 测试 7: Role 类型检查
const userRole: Role = 'user';
const assistantRole: Role = 'assistant';
console.log('✅ 测试 7 通过: Role 类型正确');

// 测试 8: ModelId 类型检查
const modelId: ModelId = 'claude-3-5-sonnet-20241022';
console.log('✅ 测试 8 通过: ModelId 类型正确');

// 测试 9: ContentBlock 类型检查
const textBlock: ContentBlock = { type: 'text', text: 'hello' };
const imageBlock: ContentBlock = {
  type: 'image',
  source: { type: 'base64', media_type: 'image/png', data: 'base64data' }
};
console.log('✅ 测试 9 通过: ContentBlock 联合类型正确');

// 测试 10: StopReason 类型检查
const stopReason: StopReason = 'end_turn';
console.log('✅ 测试 10 通过: StopReason 类型正确');

console.log('\n✅✅✅ M2 所有类型测试通过！');