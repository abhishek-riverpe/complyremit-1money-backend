import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import AppError from '../lib/AppError';
import { oneMoneyCustomerService as customerService, activityLogService } from '../services';
import type { CreateCustomerRequest } from '../types/onemoney-customer.types';
import { persistBusinessData } from '../services/business-persistence.service';
import { convertFilesToBase64 } from '../services/file-conversion.service';
import logger from '../lib/logger';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

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

  // Only persist to DB after API succeeds — single atomic transaction
  await persistBusinessData(authReq.dbUser!.id, authReq.user.clerkUserId, body, {
    oneMoneyCustomerId: result.customer_id,
    oneMoneyKybStatus: result.status,
  });

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.KYB_SUBMITTED,
    category: ActivityCategory.KYB,
    detail: 'KYB application submitted',
    metadata: { customerId: result.customer_id },
  });

  APIResponse.created(res, 'Customer created successfully', result);
};

export const getCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const result = await customerService.getCustomer(authReq.customerId!);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.KYB_STATUS_VIEWED,
    category: ActivityCategory.KYB,
    detail: 'KYB status viewed',
  });

  APIResponse.success(res, 'Customer retrieved successfully', result);
};

export const updateCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.updateCustomer(
    authReq.customerId!,
    req.body,
    idempotencyKey,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.KYB_UPDATED,
    category: ActivityCategory.KYB,
    detail: 'KYB application updated',
  });

  APIResponse.success(res, 'Customer updated successfully', result);
};

// TOS Handlers
export const createTosLink = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.createTosLink(req.body, idempotencyKey) as unknown as Record<string, unknown>;
  logger.info('TOS link created', {
    url: result?.url,
    sessionToken: result?.session_token,
    callbackUrl: (req.body as Record<string, unknown>)?.accept_redirect_url,
  });

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.TOS_LINK_CREATED,
    category: ActivityCategory.KYB,
    detail: 'TOS link created',
  });

  APIResponse.created(res, 'TOS link created successfully', result);
};

export const signTos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { sessionToken } = req.params as { sessionToken: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.signTos(sessionToken, idempotencyKey);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.TOS_SIGNED,
    category: ActivityCategory.KYB,
    detail: 'TOS signed',
  });

  APIResponse.success(res, 'TOS signed successfully', result);
};
