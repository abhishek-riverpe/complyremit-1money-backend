import AppError from "../lib/AppError";
import userRepository from "../repositories/user.repository";
import { getVerifiedUser } from "../helpers/service.helpers";
import type { CreateUserData } from "../types/user.types";

export const createUser = async (data: CreateUserData) => {
  const existing = await userRepository.findByClerkUserId(data.clerkUserId);
  if (existing) {
    throw new AppError(409, "User already exists.");
  }

  return userRepository.createUser(data);
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
