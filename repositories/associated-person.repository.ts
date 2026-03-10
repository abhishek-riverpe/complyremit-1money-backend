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

  findByOneMoneyId: async (oneMoneyAssociatedPersonId: string) => {
    return prisma.associatedPerson.findUnique({
      where: { oneMoneyAssociatedPersonId },
      include: { identifyingDocuments: true },
    });
  },

  updateWithDocuments: async (
    id: string,
    data: Record<string, unknown>,
    identifyingDocuments?: Array<{
      type: string;
      issuingCountry: string;
      nationalIdentityNumber: string;
      imageFrontUrl?: string;
      imageBackUrl?: string;
    }>,
  ) => {
    return prisma.$transaction(async (tx) => {
      if (identifyingDocuments) {
        await tx.identifyingDocument.deleteMany({
          where: { associatedPersonId: id },
        });
        for (const doc of identifyingDocuments) {
          await tx.identifyingDocument.create({
            data: { ...doc, associatedPersonId: id },
          });
        }
      }

      return tx.associatedPerson.update({
        where: { id },
        data,
        include: { identifyingDocuments: true },
      });
    });
  },
};

export default associatedPersonRepository;
