import { oneMoneyClient } from '../lib/onemoney-client';
import { validateUpstreamResponse } from '../lib/validate-response';
import {
  customerResponseSchema,
  createTosLinkResponseSchema,
  signTosResponseSchema,
} from '../schemas/onemoney-response.schema';
import type {
  CreateCustomerRequest,
  CustomerResponse,
  UpdateCustomerRequest,
  CreateTosLinkRequest,
  CreateTosLinkResponse,
  SignTosResponse,
} from '../types/onemoney-customer.types';

export const createCustomer = async (
  body: CreateCustomerRequest,
  idempotencyKey: string
): Promise<CustomerResponse> => {
  const data = await oneMoneyClient.post('/v1/customers', body, idempotencyKey);
  return validateUpstreamResponse<CustomerResponse>(data, customerResponseSchema, 'createCustomer');
};

export const getCustomer = async (
  customerId: string
): Promise<CustomerResponse> => {
  const data = await oneMoneyClient.get(`/v1/customers/${customerId}`);
  return validateUpstreamResponse<CustomerResponse>(data, customerResponseSchema, 'getCustomer');
};

export const updateCustomer = async (
  customerId: string,
  body: UpdateCustomerRequest,
  idempotencyKey: string
): Promise<CustomerResponse> => {
  const data = await oneMoneyClient.put(`/v1/customers/${customerId}`, body, idempotencyKey);
  return validateUpstreamResponse<CustomerResponse>(data, customerResponseSchema, 'updateCustomer');
};

export const createTosLink = async (
  body: CreateTosLinkRequest,
  idempotencyKey: string
): Promise<CreateTosLinkResponse> => {
  const data = await oneMoneyClient.post('/v1/customers/tos_links', body, idempotencyKey);
  return validateUpstreamResponse<CreateTosLinkResponse>(data, createTosLinkResponseSchema, 'createTosLink');
};

export const signTos = async (
  sessionToken: string,
  idempotencyKey: string
): Promise<SignTosResponse> => {
  const data = await oneMoneyClient.post(`/v1/customers/tos_links/${sessionToken}/sign`, {}, idempotencyKey);
  return validateUpstreamResponse<SignTosResponse>(data, signTosResponseSchema, 'signTos');
};
