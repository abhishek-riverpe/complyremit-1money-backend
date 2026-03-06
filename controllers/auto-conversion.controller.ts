import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { autoConversionService } from '../services';
import APIResponse from '../lib/APIResponse';

export const createRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await autoConversionService.createRule(
    (req as AuthRequest).customerId!,
    req.body,
    idempotencyKey,
  );
  APIResponse.created(res, 'Auto-conversion rule created successfully', result);
};

export const listRules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as { page_size?: number; page_num?: number };
  const result = await autoConversionService.listRules(
    (req as AuthRequest).customerId!,
    query,
  );
  APIResponse.success(res, 'Auto-conversion rules retrieved', result);
};

export const getRuleByIdempotencyKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { idempotencyKey } = req.params as { idempotencyKey: string };
  const result = await autoConversionService.getRuleByIdempotencyKey(
    (req as AuthRequest).customerId!,
    idempotencyKey,
  );
  APIResponse.success(res, 'Auto-conversion rule retrieved', result);
};

export const getRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { ruleId } = req.params as { ruleId: string };
  const result = await autoConversionService.getRule(
    (req as AuthRequest).customerId!,
    ruleId,
  );
  APIResponse.success(res, 'Auto-conversion rule retrieved', result);
};

export const deleteRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { ruleId } = req.params as { ruleId: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await autoConversionService.deleteRule(
    (req as AuthRequest).customerId!,
    ruleId,
    idempotencyKey,
  );
  APIResponse.success(res, 'Auto-conversion rule deleted successfully', result);
};

export const listOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { ruleId } = req.params as { ruleId: string };
  const result = await autoConversionService.listOrders(
    (req as AuthRequest).customerId!,
    ruleId,
  );
  APIResponse.success(res, 'Orders retrieved', result);
};

export const getOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { ruleId, orderId } = req.params as { ruleId: string; orderId: string };
  const result = await autoConversionService.getOrder(
    (req as AuthRequest).customerId!,
    ruleId,
    orderId,
  );
  APIResponse.success(res, 'Order retrieved', result);
};
