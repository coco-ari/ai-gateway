// Anthropic SDK 客户端类

import { Requestor } from './core/request';
import { Messages } from './resources/messages';

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
  version?: string;
}

export class Anthropic {
  private requestor: Requestor;
  public messages: Messages;

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new Error('apiKey is required');
    }

    const baseURL = options.baseURL || 'https://api.anthropic.com';
    const version = options.version || '2023-06-01';

    this.requestor = new Requestor(baseURL, options.apiKey, version);
    this.messages = new Messages(this.requestor);
  }
}