import { prisma } from '../lib/prisma';
import type { Prisma } from '../generated/prisma/client';

interface CreateRuleData {
  userId: string;
  oneMoneyRuleId: string;
  oneMoneyCustomerId: string;
  status?: string;
  sourceAsset: string;
  sourceNetwork: string;
  destinationAsset: string;
  destinationNetwork?: string;
}

interface UpsertOrderData {
  ruleId: string;
  oneMoneyOrderId: string;
  status: string;
  failureReason?: string;
  payload?: Prisma.InputJsonValue;
}

const autoConversionRepository = {
  createRule: async (data: CreateRuleData) => {
    return prisma.autoConversionRule.create({ data });
  },

  findByOneMoneyRuleId: async (oneMoneyRuleId: string) => {
    return prisma.autoConversionRule.findUnique({
      where: { oneMoneyRuleId },
      include: { orders: true },
    });
  },

  updateStatusByOneMoneyRuleId: async (oneMoneyRuleId: string, status: string) => {
    return prisma.autoConversionRule.update({
      where: { oneMoneyRuleId },
      data: { status },
    });
  },

  upsertOrder: async (data: UpsertOrderData) => {
    return prisma.autoConversionOrder.upsert({
      where: { oneMoneyOrderId: data.oneMoneyOrderId },
      create: data,
      update: {
        status: data.status,
        failureReason: data.failureReason,
        payload: data.payload,
      },
    });
  },

  findOrderByOneMoneyOrderId: async (oneMoneyOrderId: string) => {
    return prisma.autoConversionOrder.findUnique({
      where: { oneMoneyOrderId },
    });
  },
};

export default autoConversionRepository;
