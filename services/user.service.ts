import AppError from "../lib/AppError";
import userRepository from "../repositories/user.repository";
import { getVerifiedUser } from "../helpers/service.helpers";
import type { CreateUserData } from "../types/user.types";

export const createUser = async (data: CreateUserData) => {
  const existing = await userRepository.findByClerkUserId(data.clerkUserId);
  if (existing) {
    throw new AppError(409, "User already exists.");
  }

  try {
    return await userRepository.createUser(data);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      throw new AppError(409, "User already exists.");
    }
    throw error;
  }
};

export const getUser = async (clerkUserId: string) => {
  return getVerifiedUser(clerkUserId);
};

export const linkPaymentAccount = async (
  clerkUserId: string,
  customerId: string,
  kybStatus: string,
) => {
  return userRepository.updateUser(clerkUserId, {
    oneMoneyCustomerId: customerId,
    oneMoneyKybStatus: kybStatus,
  });
};
