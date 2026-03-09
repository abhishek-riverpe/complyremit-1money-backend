import activityLogRepository from "../repositories/activity-log.repository";
import logger from "../lib/logger";
import type { LogActivityParams, ActivityContext } from "../types/activity-log.types";
import type { Prisma } from "../generated/prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const buildContext = (source: {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  dbUser?: { id: string };
}): ActivityContext => {
  return {
    userId: source.dbUser?.id ?? "",
    ipAddress: source.ip,
    userAgent: source.headers?.["user-agent"] as string | undefined,
  };
};

export const log = (params: LogActivityParams): void => {
  setImmediate(async () => {
    try {
      await activityLogRepository.create({
        userId: params.context.userId,
        action: params.action,
        category: params.category,
        detail: params.detail,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: params.context.ipAddress,
        userAgent: params.context.userAgent,
      });
    } catch (err) {
      logger.error("Failed to write activity log", {
        error: err,
        action: params.action,
      });
    }
  });
};

export const getMyActivity = async (
  userId: string,
  query: { category?: string; cursor?: string; limit?: number },
) => {
  const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const rows = await activityLogRepository.findByUserId({
    userId,
    category: query.category,
    cursor: query.cursor,
    limit,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items.at(-1)!.id : undefined;

  return { items, nextCursor, hasMore };
};
