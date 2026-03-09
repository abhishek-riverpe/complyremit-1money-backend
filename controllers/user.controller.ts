import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import { userService, activityLogService } from '../services';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { clerkUserId, email } = (req as AuthRequest).user;
  const user = await userService.createUser({ clerkUserId, email });

  // No dbUser middleware on this route — use newly created user's id
  activityLogService.log({
    context: {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
    action: ActivityAction.USER_CREATED,
    category: ActivityCategory.AUTH,
    detail: 'User account created',
  });

  APIResponse.created(res, 'User created successfully', user);
};

export const getUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await userService.getUser(authReq.user.clerkUserId);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.BUSINESS_DATA_VIEWED,
    category: ActivityCategory.PROFILE,
    detail: 'Business data viewed',
  });

  APIResponse.success(res, 'User fetched successfully', user);
};
