// 错误类定义

export class AnthropicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnthropicError';
  }
}

export class AuthenticationError extends AnthropicError {
  constructor(message: string = 'Invalid API key') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends AnthropicError {
  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'PermissionError';
  }
}

export class NotFoundError extends AnthropicError {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AnthropicError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class APIError extends AnthropicError {
  constructor(message: string = 'API error') {
    super(message);
    this.name = 'APIError';
  }
}

export class OverloadedError extends AnthropicError {
  constructor(message: string = 'Service overloaded') {
    super(message);
    this.name = 'OverloadedError';
  }
}

// 根据错误类型创建对应错误
export function createErrorFromType(type: string, message: string): AnthropicError {
  switch (type) {
    case 'authentication_error':
      return new AuthenticationError(message);
    case 'permission_error':
      return new PermissionError(message);
    case 'not_found_error':
      return new NotFoundError(message);
    case 'rate_limit_error':
      return new RateLimitError(message);
    case 'api_error':
      return new APIError(message);
    case 'overloaded_error':
      return new OverloadedError(message);
    default:
      return new AnthropicError(message);
  }
}