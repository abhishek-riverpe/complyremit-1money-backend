import { prisma } from '../lib/prisma';
import type { CreateAssociatedPersonData } from '../types/user.types';

const associatedPersonRepository = {
  create: async (userId: string, data: CreateAssociatedPersonData) => {
    return prisma.associatedPerson.create({
      data: { ...data, userId },
    });
  },

  findByUserId: async (userId: string) => {
    return prisma.associatedPerson.findMany({
      where: { userId },
    });
  },

  findById: async (id: string) => {
    return prisma.associatedPerson.findUnique({
      where: { id },
    });
  },

  deleteByUserId: async (userId: string) => {
    return prisma.associatedPerson.deleteMany({ where: { userId } });
  },

  deleteById: async (id: string) => {
    return prisma.associatedPerson.delete({ where: { id } });
  },

  findByOneMoneyId: async (oneMoneyAssociatedPersonId: string) => {
    return prisma.associatedPerson.findUnique({
      where: { oneMoneyAssociatedPersonId },
    });
  },

  update: async (id: string, data: Record<string, unknown>) => {
    return prisma.associatedPerson.update({
      where: { id },
      data,
    });
  },
};

export default associatedPersonRepository;
