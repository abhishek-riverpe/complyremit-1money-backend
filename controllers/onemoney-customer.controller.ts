import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import AppError from '../lib/AppError';
import { oneMoneyCustomerService as customerService, activityLogService } from '../services';
import type { CreateCustomerRequest, UpdateCustomerRequest, CustomerResponse } from '../types/onemoney-customer.types';
import { persistBusinessData } from '../services/business-persistence.service';
import userRepository from '../repositories/user.repository';
import type { UpdateBusinessData } from '../types/user.types';
import type { BusinessType } from '../generated/prisma/client';
import { convertFilesToBase64 } from '../services/file-conversion.service';
import logger from '../lib/logger';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

export const createCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;

  if (authReq.dbUser?.oneMoneyCustomerId) {
    throw new AppError(409, 'User already has an associated payment account');
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;
  const body = req.body as CreateCustomerRequest;

  // Convert R2 file keys to base64 for OneMoney API
  const apiBody = await convertFilesToBase64(body);

  // Create customer in 1Money API first (fail-fast before any DB writes)
  const result = await customerService.createCustomer(apiBody, idempotencyKey) as CustomerResponse;

  // Only persist to DB after API succeeds — single atomic transaction
  await persistBusinessData(authReq.dbUser!.id, authReq.user.clerkUserId, body, {
    oneMoneyCustomerId: result.customer_id,
    oneMoneyKybStatus: result.status,
  }, result.associated_persons);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.KYB_SUBMITTED,
    category: ActivityCategory.KYB,
    detail: 'KYB application submitted',
    metadata: { customerId: result.customer_id },
  });

  APIResponse.created(res, 'Customer created successfully', result);
};

export const getCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const result = await customerService.getCustomer(authReq.customerId!);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.KYB_STATUS_VIEWED,
    category: ActivityCategory.KYB,
    detail: 'KYB status viewed',
  });

  APIResponse.success(res, 'Customer retrieved successfully', result);
};

export const updateCustomer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;

  const kybStatus = authReq.dbUser?.oneMoneyKybStatus;
  if (kybStatus && !['draft', 'action_required', 'rejected'].includes(kybStatus)) {
    throw new AppError(409, 'KYB cannot be edited in its current status');
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;
  const body = req.body as UpdateCustomerRequest;
  const result = await customerService.updateCustomer(
    authReq.customerId!,
    body,
    idempotencyKey,
  );

  // Persist updated fields to local DB
  const dbUpdate: UpdateBusinessData = {};
  if (body.business_legal_name !== undefined) dbUpdate.businessLegalName = body.business_legal_name;
  if (body.business_description !== undefined) dbUpdate.businessDescription = body.business_description;
  if (body.business_type !== undefined) dbUpdate.businessType = body.business_type as BusinessType;
  if (body.business_industry !== undefined) dbUpdate.businessIndustry = body.business_industry;
  if (body.business_registration_number !== undefined) dbUpdate.businessRegistrationNumber = body.business_registration_number;
  if (body.date_of_incorporation !== undefined) dbUpdate.dateOfIncorporation = body.date_of_incorporation;
  if (body.primary_website !== undefined) dbUpdate.primaryWebsite = body.primary_website;
  if (body.publicly_traded !== undefined) dbUpdate.publiclyTraded = body.publicly_traded;
  if (body.tax_id !== undefined) dbUpdate.taxId = body.tax_id;
  if (body.tax_type !== undefined) dbUpdate.taxType = body.tax_type;
  if (body.tax_country !== undefined) dbUpdate.taxCountry = body.tax_country;
  if (body.registered_address) {
    dbUpdate.registeredAddressStreetLine1 = body.registered_address.street_line_1;
    dbUpdate.registeredAddressStreetLine2 = body.registered_address.street_line_2;
    dbUpdate.registeredAddressCity = body.registered_address.city;
    dbUpdate.registeredAddressState = body.registered_address.state;
    dbUpdate.registeredAddressCountry = body.registered_address.country;
    dbUpdate.registeredAddressSubdivision = body.registered_address.subdivision;
    dbUpdate.registeredAddressPostalCode = body.registered_address.postal_code;
  }
  if (Object.keys(dbUpdate).length > 0) {
    await userRepository.updateBusinessData(authReq.user.clerkUserId, dbUpdate);
  }

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.KYB_UPDATED,
    category: ActivityCategory.KYB,
    detail: 'KYB application updated',
  });

  APIResponse.success(res, 'Customer updated successfully', result);
};

// TOS Handlers
export const createTosLink = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.createTosLink(req.body, idempotencyKey) as unknown as Record<string, unknown>;
  logger.info('TOS link created', {
    url: result?.url,
    sessionToken: result?.session_token,
    callbackUrl: (req.body as Record<string, unknown>)?.accept_redirect_url,
  });

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.TOS_LINK_CREATED,
    category: ActivityCategory.KYB,
    detail: 'TOS link created',
  });

  APIResponse.created(res, 'TOS link created successfully', result);
};

export const signTos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { sessionToken } = req.params as { sessionToken: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const result = await customerService.signTos(sessionToken, idempotencyKey);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.TOS_SIGNED,
    category: ActivityCategory.KYB,
    detail: 'TOS signed',
  });

  APIResponse.success(res, 'TOS signed successfully', result);
};
