import { oneMoneyClient } from '../lib/onemoney-client';
import type {
  CreateAutoConversionRuleRequest,
  AutoConversionRuleResponse,
  AutoConversionRuleListResponse,
  AutoConversionOrderResponse,
  AutoConversionOrderListResponse,
} from '../types/auto-conversion.types';

export const createRule = async (
  customerId: string,
  body: CreateAutoConversionRuleRequest,
  idempotencyKey: string,
): Promise<AutoConversionRuleResponse> => {
  return oneMoneyClient.post(`/v1/customers/${customerId}/auto-conversion-rules`, body, idempotencyKey);
};

export const listRules = async (
  customerId: string,
  query?: { page_size?: number; page_num?: number },
): Promise<AutoConversionRuleListResponse> => {
  const params: Record<string, string> = {};
  if (query?.page_size) params['page_size'] = String(query.page_size);
  if (query?.page_num) params['page_num'] = String(query.page_num);
  return oneMoneyClient.get(`/v1/customers/${customerId}/auto-conversion-rules/list`, params);
};

export const getRule = async (
  customerId: string,
  ruleId: string,
): Promise<AutoConversionRuleResponse> => {
  return oneMoneyClient.get(`/v1/customers/${customerId}/auto-conversion-rules/${ruleId}`);
};

export const getRuleByIdempotencyKey = async (
  customerId: string,
  idempotencyKey: string,
): Promise<AutoConversionRuleResponse> => {
  return oneMoneyClient.get(`/v1/customers/${customerId}/auto-conversion-rules`, {
    idempotency_key: idempotencyKey,
  });
};

export const deleteRule = async (
  customerId: string,
  ruleId: string,
  idempotencyKey: string,
): Promise<unknown> => {
  return oneMoneyClient.delete(`/v1/customers/${customerId}/auto-conversion-rules/${ruleId}`, idempotencyKey);
};

export const listOrders = async (
  customerId: string,
  ruleId: string,
): Promise<AutoConversionOrderListResponse> => {
  return oneMoneyClient.get(`/v1/customers/${customerId}/auto-conversion-rules/${ruleId}/orders`);
};

export const getOrder = async (
  customerId: string,
  ruleId: string,
  orderId: string,
): Promise<AutoConversionOrderResponse> => {
  return oneMoneyClient.get(`/v1/customers/${customerId}/auto-conversion-rules/${ruleId}/orders/${orderId}`);
};
