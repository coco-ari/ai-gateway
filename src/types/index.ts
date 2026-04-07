// Anthropic Messages API 类型定义
// 参考: https://docs.anthropic.com/en/api/messages

// ============================================
// 内容块类型
// ============================================

/**
 * 文本内容块
 */
export interface TextBlock {
  type: 'text';
  text: string;
}

/**
 * 图片来源类型
 */
export interface ImageSourceUrl {
  type: 'url';
  url: string;
}

export interface ImageSourceBase64 {
  type: 'base64';
  media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  data: string;
}

export type ImageSource = ImageSourceUrl | ImageSourceBase64;

/**
 * 图片内容块
 */
export interface ImageBlock {
  type: 'image';
  source: ImageSource;
}

/**
 * 工具使用块 - 模型请求调用工具
 */
export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/**
 * 工具结果块 - 返回给模型的工具执行结果
 */
export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/**
 * 思考内容块 - AI 的内部思考过程
 */
export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

/**
 * 内容块联合类型（扩展支持 Tool Calling 和 Thinking）
 */
export type ContentBlock = TextBlock | ImageBlock | ToolUseBlock | ToolResultBlock | ThinkingBlock;

// ============================================
// 消息类型
// ============================================

/**
 * 用户角色
 */
export type Role = 'user' | 'assistant';

/**
 * 消息结构
 * content 可以是字符串（简单文本）或内容块数组（多模态）
 */
export interface Message {
  role: Role;
  content: string | ContentBlock[];
}

// ============================================
// 请求参数类型
// ============================================

/**
 * 可用的模型 ID
 */
export type ModelId =
  | 'glm-5'
  | 'kimi-k2.5';

/**
 * 结束原因
 */
export type StopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';

/**
 * 工具定义 - 告诉模型有哪些工具可用
 */
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

/**
 * 创建消息的请求参数
 */
export interface MessageCreateParams {
  /** 模型 ID - 必填 */
  model: ModelId | string;

  /** 最大输出 token 数 - 必填 */
  max_tokens: number;

  /** 消息列表 - 必填 */
  messages: Message[];

  /** 系统提示词 - 可选 */
  system?: string;

  /** 温度参数 (0-1) - 可选，默认 1 */
  temperature?: number;

  /** Top-K 参数 - 可选 */
  top_k?: number;

  /** Top-P 参数 - 可选 */
  top_p?: number;

  /** 自定义停止序列 - 可选 */
  stop_sequences?: string[];

  /** 是否流式响应 - 可选，默认 false */
  stream?: boolean;

  /** 用户标识 - 可选 */
  metadata?: {
    user_id?: string;
  };

  /** 工具列表 - 可选，用于 Tool Calling */
  tools?: ToolDefinition[];
}

// ============================================
// 响应类型
// ============================================

/**
 * Token 使用量
 */
export interface Usage {
  input_tokens: number;
  output_tokens: number;
}

/**
 * 消息响应
 */
export interface MessageResponse {
  /** 消息 ID */
  id: string;

  /** 响应类型，固定为 'message' */
  type: 'message';

  /** 角色，固定为 'assistant' */
  role: 'assistant';

  /** 内容块列表 */
  content: ContentBlock[];

  /** 使用的模型 */
  model: string;

  /** 结束原因 */
  stop_reason: StopReason | null;

  /** 结束序列（如果有） */
  stop_sequence: string | null;

  /** Token 使用量 */
  usage: Usage;
}

// ============================================
// 错误类型
// ============================================

/**
 * API 错误响应
 */
export interface APIError {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

/**
 * 错误类型枚举
 */
export type ErrorType =
  | 'invalid_request_error'
  | 'authentication_error'
  | 'permission_error'
  | 'not_found_error'
  | 'rate_limit_error'
  | 'api_error'
  | 'overloaded_error';