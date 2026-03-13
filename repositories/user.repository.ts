import { prisma } from "../lib/prisma";
import type { CreateUserData, UpdateUserData, UpdateBusinessData } from "../types/user.types";

const includeRelations = {
  associatedPersons: true,
  documents: true,
};

const userRepository = {
  createUser: async (data: CreateUserData) => {
    return prisma.user.create({ data });
  },

  findByClerkUserId: async (clerkUserId: string) => {
    return prisma.user.findUnique({
      where: { clerkUserId },
      include: includeRelations,
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: includeRelations,
    });
  },

  updateUser: async (clerkUserId: string, data: UpdateUserData) => {
    return prisma.user.update({ where: { clerkUserId }, data });
  },

  updateBusinessData: async (clerkUserId: string, data: UpdateBusinessData) => {
    return prisma.user.update({
      where: { clerkUserId },
      data,
      include: includeRelations,
    });
  },

  findByOneMoneyCustomerId: async (oneMoneyCustomerId: string) => {
    return prisma.user.findUnique({
      where: { oneMoneyCustomerId },
      include: includeRelations,
    });
  },

  updateKybStatusByCustomerId: async (oneMoneyCustomerId: string, status: string) => {
    return prisma.user.update({
      where: { oneMoneyCustomerId },
      data: { oneMoneyKybStatus: status },
    });
  },
};

export default userRepository;
