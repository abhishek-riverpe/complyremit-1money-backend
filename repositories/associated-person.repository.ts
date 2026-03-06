import { prisma } from '../lib/prisma';
import type { CreateAssociatedPersonData } from '../types/user.types';

const associatedPersonRepository = {
  createWithDocuments: async (userId: string, data: CreateAssociatedPersonData) => {
    const { identifyingDocuments, ...personData } = data;
    return prisma.associatedPerson.create({
      data: {
        ...personData,
        userId,
        identifyingDocuments: {
          create: identifyingDocuments,
        },
      },
      include: { identifyingDocuments: true },
    });
  },

  findByUserId: async (userId: string) => {
    return prisma.associatedPerson.findMany({
      where: { userId },
      include: { identifyingDocuments: true },
    });
  },

  findById: async (id: string) => {
    return prisma.associatedPerson.findUnique({
      where: { id },
      include: { identifyingDocuments: true },
    });
  },

  deleteByUserId: async (userId: string) => {
    return prisma.associatedPerson.deleteMany({ where: { userId } });
  },

  deleteById: async (id: string) => {
    return prisma.associatedPerson.delete({ where: { id } });
  },
};

export default associatedPersonRepository;
