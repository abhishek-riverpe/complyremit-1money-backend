import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { simulateTransactionsService, activityLogService } from '../services';
import APIResponse from '../lib/APIResponse';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

export const simulateTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const customerId = authReq.customerId!;
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await simulateTransactionsService.simulateTransaction(
    customerId,
    req.body,
    idempotencyKey,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.TRANSACTION_SIMULATED,
    category: ActivityCategory.TRANSACTION,
    detail: 'Transaction simulated',
  });

  APIResponse.success(res, 'Transaction simulated', result);
};
