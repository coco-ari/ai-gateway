// HTTP 请求封装
// 统一处理请求头、错误响应

import { APIError } from '../types';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
}

export class APIConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIConnectionError';
  }
}

export class APIResponseError extends Error {
  status: number;
  errorData: APIError | null;

  constructor(message: string, status: number, errorData: APIError | null = null) {
    super(message);
    this.name = 'APIResponseError';
    this.status = status;
    this.errorData = errorData;
  }
}

export class Requestor {
  private baseURL: string;
  private apiKey: string;
  private version: string;

  constructor(baseURL: string, apiKey: string, version: string = '2023-06-01') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.version = version;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = `${this.baseURL}${options.path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': this.version,
    };

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: APIError | null = null;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          // 无法解析错误响应
        }

        throw new APIResponseError(
          `API error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof APIResponseError) {
        throw error;
      }
      throw new APIConnectionError(`Connection error: ${(error as Error).message}`);
    }
  }


  async stream (options: RequestOptions): Promise<ReadableStreamDefaultReader>{
    const url = `${this.baseURL}${options.path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': this.version,
    };

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      return response.body!.getReader();

    } catch (error) {
      if (error instanceof APIResponseError) {
        throw error;
      }
      throw new APIConnectionError(`Connection error: ${(error as Error).message}`);
    }
  }
}