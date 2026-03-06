import { prisma } from '../lib/prisma';
import type { CreateBusinessDocumentData } from '../types/user.types';

const businessDocumentRepository = {
  create: async (userId: string, data: CreateBusinessDocumentData) => {
    return prisma.businessDocument.create({
      data: { ...data, userId },
    });
  },

  createMany: async (userId: string, data: CreateBusinessDocumentData[]) => {
    return prisma.$transaction(
      data.map((doc) =>
        prisma.businessDocument.create({ data: { ...doc, userId } })
      )
    );
  },

  findByUserId: async (userId: string) => {
    return prisma.businessDocument.findMany({ where: { userId } });
  },

  findById: async (id: string) => {
    return prisma.businessDocument.findUnique({ where: { id } });
  },

  deleteByUserId: async (userId: string) => {
    return prisma.businessDocument.deleteMany({ where: { userId } });
  },

  deleteById: async (id: string) => {
    return prisma.businessDocument.delete({ where: { id } });
  },
};

export default businessDocumentRepository;
