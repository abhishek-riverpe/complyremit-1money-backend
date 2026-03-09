import axios, { AxiosError } from 'axios';
import AppError from './AppError';
import logger from './logger';
import type { OneMoneyErrorResponse } from '../types/onemoney.types';

class OneMoneyClient {
  private readonly baseUrl: string;
  private readonly bearerToken: string;

  constructor(baseUrl: string, bearerToken: string) {
    let url = baseUrl;
    while (url.endsWith('/')) url = url.slice(0, -1);
    this.baseUrl = url;
    this.bearerToken = bearerToken;
  }

  private validatePath(path: string): void {
    if (!path.startsWith('/') || path.includes('..') || path.includes('//') || path.includes('%') || path.includes('\0')) {
      throw new AppError(400, 'Invalid API path');
    }
    for (const segment of path.split('/').filter(Boolean)) {
      if (/[^a-zA-Z0-9_\-]/.test(segment)) {
        throw new AppError(400, 'Invalid API path');
      }
    }
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options?: {
      body?: unknown;
      query?: Record<string, string>;
      idempotencyKey?: string;
    },
  ): Promise<T> {
    this.validatePath(path);

    const headers: Record<string, string> = {
      'Authorization': this.bearerToken.startsWith('Bearer ') ? this.bearerToken : `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json',
    };

    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const url = `${this.baseUrl}${path}`;
    logger.info('1Money API request', { method, url });

    try {
      const response = await axios({
        method,
        url,
        headers,
        data: options?.body,
        params: options?.query,
        timeout: 120000,
      });

      return response.data as T;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorBody = error.response.data as OneMoneyErrorResponse;
        logger.error('Upstream payment API error', {
          status: error.response.status,
          code: errorBody?.code,
          detail: errorBody?.detail,
          instance: errorBody?.instance,
          method,
          url,
          path,
          responseUrl: error.response.config?.url,
          responseData: JSON.stringify(error.response.data),
        });
        const status = error.response.status >= 400 && error.response.status < 500 ? error.response.status : 502;
        throw new AppError(status, 'Payment request failed. Please try again later.');
      }
      throw error;
    }
  }

  async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  async post<T>(path: string, body: unknown, idempotencyKey?: string): Promise<T> {
    return this.request<T>('POST', path, { body, idempotencyKey });
  }

  async put<T>(path: string, body: unknown, idempotencyKey?: string): Promise<T> {
    return this.request<T>('PUT', path, { body, idempotencyKey });
  }

  async delete<T>(path: string, idempotencyKey?: string): Promise<T> {
    return this.request<T>('DELETE', path, { idempotencyKey });
  }
}

export const oneMoneyClient = new OneMoneyClient(
  process.env['ONEMONEY_API_BASE_URL'] ?? '',
  process.env['ONEMONEY_BEARER_TOKEN'] ?? '',
);
