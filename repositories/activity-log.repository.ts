import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";

interface CreateActivityLogData {
  userId: string;
  action: string;
  category: string;
  detail?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

interface FindByUserIdOptions {
  userId: string;
  category?: string;
  cursor?: string;
  limit: number;
}

const userFacingSelect = {
  id: true,
  action: true,
  category: true,
  detail: true,
  metadata: true,
  createdAt: true,
};

const activityLogRepository = {
  create: async (data: CreateActivityLogData) => {
    return prisma.activityLog.create({ data });
  },

  findByUserId: async ({ userId, category, cursor, limit }: FindByUserIdOptions) => {
    return prisma.activityLog.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
      },
      select: userFacingSelect,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },
};

export default activityLogRepository;
