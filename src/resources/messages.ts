// Messages API 资源类

import { MessageCreateParams, MessageResponse } from '../types';
import { Requestor, APIResponseError } from '../core/request';
import { createErrorFromType } from '../core/error';

export class Messages {
  private requestor: Requestor;

  constructor(requestor: Requestor) {
    this.requestor = requestor;
  }

  async create(params: MessageCreateParams): Promise<MessageResponse> {
    try {
      const response = await this.requestor.request<MessageResponse>({
        method: 'POST',
        path: '/v1/messages',
        body: params,
      });
      return response;
    } catch (error) {
      if (error instanceof APIResponseError && error.errorData) {
        const errorInfo = error.errorData.error;
        throw createErrorFromType(errorInfo.type, errorInfo.message);
      }
      throw error;
    }
  }
}