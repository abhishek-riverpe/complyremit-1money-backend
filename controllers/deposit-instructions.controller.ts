import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import { depositInstructionsService, activityLogService } from '../services';
import APIResponse from '../lib/APIResponse';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

export const getDepositInstructions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { asset, network } = req.query as { asset: string; network?: string };
  const instructions = await depositInstructionsService.getDepositInstructions(
    authReq.customerId!,
    asset,
    network,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.DEPOSIT_INSTRUCTIONS_VIEWED,
    category: ActivityCategory.DEPOSIT,
    detail: 'Deposit instructions viewed',
    metadata: { asset, network },
  });

  APIResponse.success(res, 'Deposit instructions retrieved', instructions);
};
