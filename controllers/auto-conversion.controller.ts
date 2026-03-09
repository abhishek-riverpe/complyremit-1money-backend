import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { autoConversionService, activityLogService } from '../services';
import APIResponse from '../lib/APIResponse';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

export const createRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await autoConversionService.createRule(
    authReq.customerId!,
    req.body,
    idempotencyKey,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_RULE_CREATED,
    category: ActivityCategory.CONVERSION,
    detail: 'Auto-conversion rule created',
  });

  APIResponse.created(res, 'Auto-conversion rule created successfully', result);
};

export const listRules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const query = req.query as { page_size?: number; page_num?: number };
  const result = await autoConversionService.listRules(
    authReq.customerId!,
    query,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_RULES_VIEWED,
    category: ActivityCategory.CONVERSION,
    detail: 'Auto-conversion rules viewed',
  });

  APIResponse.success(res, 'Auto-conversion rules retrieved', result);
};

export const getRuleByIdempotencyKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { idempotencyKey } = req.params as { idempotencyKey: string };
  const result = await autoConversionService.getRuleByIdempotencyKey(
    authReq.customerId!,
    idempotencyKey,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_RULE_VIEWED,
    category: ActivityCategory.CONVERSION,
    detail: 'Auto-conversion rule viewed',
  });

  APIResponse.success(res, 'Auto-conversion rule retrieved', result);
};

export const getRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { ruleId } = req.params as { ruleId: string };
  const result = await autoConversionService.getRule(
    authReq.customerId!,
    ruleId,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_RULE_VIEWED,
    category: ActivityCategory.CONVERSION,
    detail: 'Auto-conversion rule viewed',
  });

  APIResponse.success(res, 'Auto-conversion rule retrieved', result);
};

export const deleteRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { ruleId } = req.params as { ruleId: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await autoConversionService.deleteRule(
    authReq.customerId!,
    ruleId,
    idempotencyKey,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_RULE_DELETED,
    category: ActivityCategory.CONVERSION,
    detail: 'Auto-conversion rule deleted',
    metadata: { ruleId },
  });

  APIResponse.success(res, 'Auto-conversion rule deleted successfully', result);
};

export const listOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { ruleId } = req.params as { ruleId: string };
  const result = await autoConversionService.listOrders(
    authReq.customerId!,
    ruleId,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_ORDERS_VIEWED,
    category: ActivityCategory.CONVERSION,
    detail: 'Conversion orders viewed',
    metadata: { ruleId },
  });

  APIResponse.success(res, 'Orders retrieved', result);
};

export const getOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { ruleId, orderId } = req.params as { ruleId: string; orderId: string };
  const result = await autoConversionService.getOrder(
    authReq.customerId!,
    ruleId,
    orderId,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.CONVERSION_ORDER_VIEWED,
    category: ActivityCategory.CONVERSION,
    detail: 'Conversion order viewed',
    metadata: { ruleId, orderId },
  });

  APIResponse.success(res, 'Order retrieved', result);
};
