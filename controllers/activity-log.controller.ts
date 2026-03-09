import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth";
import APIResponse from "../lib/APIResponse";
import { activityLogService } from "../services";

export const getMyActivity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { category, cursor, limit } = req.query as {
    category?: string;
    cursor?: string;
    limit?: string;
  };

  const data = await activityLogService.getMyActivity(authReq.dbUser!.id, {
    category,
    cursor,
    limit: limit ? Number(limit) : undefined,
  });

  APIResponse.success(res, "Activity log retrieved", data);
};
