import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import { userService } from '../services';

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { clerkUserId, email } = (req as AuthRequest).user;
  const user = await userService.createUser({ clerkUserId, email });
  APIResponse.created(res, 'User created successfully', user);
};

export const getUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await userService.getUser((req as AuthRequest).user.clerkUserId);
  APIResponse.success(res, 'User fetched successfully', user);
};
