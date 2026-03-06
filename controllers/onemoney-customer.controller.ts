import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import AppError from '../lib/AppError';
import { oneMoneyCustomerService as customerService, userService } from '../services';
import type { CreateCustomerRequest } from '../types/onemoney-customer.types';
import { persistBusinessData } from '../services/business-persistence.service';
import { convertFilesToBase64 } from '../services/file-conversion.service';

export const createCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;

  if (authReq.dbUser?.oneMoneyCustomerId) {
    throw new AppError(409, 'User already has an associated payment account');
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;
  const body = req.body as CreateCustomerRequest;

  // Convert R2 file keys to base64 for OneMoney API
  const apiBody = await convertFilesToBase64(body);

  // Create customer in 1Money API first (fail-fast before any DB writes)
  const result = await customerService.createCustomer(apiBody, idempotencyKey) as {
    customer_id: string;
    status: string;
  };

  // Only persist to DB after API succeeds
  await persistBusinessData(authReq.dbUser!.id, authReq.user.clerkUserId, body);
  await userService.linkPaymentAccount(authReq.user.clerkUserId, result.customer_id, result.status);

  APIResponse.created(res, 'Customer created successfully', result);
};

export const getCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await customerService.getCustomer((req as AuthRequest).customerId!);
  APIResponse.success(res, 'Customer retrieved successfully', result);
};

export const updateCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.updateCustomer(
    (req as AuthRequest).customerId!,
    req.body,
    idempotencyKey,
  );
  APIResponse.success(res, 'Customer updated successfully', result);
};

// TOS Handlers
export const createTosLink = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.createTosLink(req.body, idempotencyKey);
  APIResponse.created(res, 'TOS link created successfully', result);
};

export const signTos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { sessionToken } = req.params as { sessionToken: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.signTos(sessionToken, idempotencyKey);
  APIResponse.success(res, 'TOS signed successfully', result);
};
