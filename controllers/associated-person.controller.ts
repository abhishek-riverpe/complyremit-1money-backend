import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import AppError from '../lib/AppError';
import { associatedPersonService, activityLogService } from '../services';
import { convertPersonFilesToBase64 } from '../services/file-conversion.service';
import associatedPersonRepository from '../repositories/associated-person.repository';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';
import type { CreateAssociatedPersonRequest, UpdateAssociatedPersonRequest } from '../types/associated-person.types';
import type { AssociatedPerson } from '../types/onemoney-customer.types';

const KYB_EDITABLE_STATUSES = ['draft', 'action_required', 'rejected'];

const guardKybStatus = (authReq: AuthRequest): void => {
  const kybStatus = authReq.dbUser?.oneMoneyKybStatus;
  if (kybStatus && !KYB_EDITABLE_STATUSES.includes(kybStatus)) {
    throw new AppError(409, 'KYB cannot be edited in its current status');
  }
};

const mapPersonToDbData = (person: AssociatedPerson, oneMoneyId: string) => ({
  oneMoneyAssociatedPersonId: oneMoneyId,
  firstName: person.first_name,
  middleName: person.middle_name,
  lastName: person.last_name,
  email: person.email,
  birthDate: person.birth_date,
  primaryNationality: person.primary_nationality,
  hasOwnership: person.has_ownership,
  ownershipPercentage: person.ownership_percentage,
  hasControl: person.has_control,
  isSigner: person.is_signer,
  isDirector: person.is_director,
  countryOfTax: person.country_of_tax,
  taxType: person.tax_type,
  taxId: person.tax_id,
  poa: person.poa,
  poaType: person.poa_type,
  residentialAddressStreetLine1: person.residential_address.street_line_1,
  residentialAddressStreetLine2: person.residential_address.street_line_2,
  residentialAddressCity: person.residential_address.city,
  residentialAddressState: person.residential_address.state,
  residentialAddressCountry: person.residential_address.country,
  residentialAddressSubdivision: person.residential_address.subdivision,
  residentialAddressPostalCode: person.residential_address.postal_code,
  identifyingDocuments: person.identifying_information.map((doc) => ({
    type: doc.type,
    issuingCountry: doc.issuing_country,
    nationalIdentityNumber: doc.national_identity_number,
    imageFrontUrl: doc.image_front,
    imageBackUrl: doc.image_back,
  })),
});

export const createAssociatedPerson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  guardKybStatus(authReq);

  const idempotencyKey = req.headers['idempotency-key'] as string;
  const body = req.body as CreateAssociatedPersonRequest;

  const apiBody = await convertPersonFilesToBase64(body);

  const result = await associatedPersonService.createAssociatedPerson(
    authReq.customerId!,
    apiBody,
    idempotencyKey,
  );

  const dbData = mapPersonToDbData(body, result.associated_person_id);
  await associatedPersonRepository.createWithDocuments(authReq.dbUser!.id, dbData);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.ASSOCIATED_PERSON_CREATED,
    category: ActivityCategory.KYB,
    detail: 'Associated person created',
    metadata: { associatedPersonId: result.associated_person_id },
  });

  APIResponse.created(res, 'Associated person created successfully', result);
};

export const listAssociatedPersons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;

  const result = await associatedPersonService.listAssociatedPersons(
    authReq.customerId!,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.ASSOCIATED_PERSON_LISTED,
    category: ActivityCategory.KYB,
    detail: 'Associated persons listed',
  });

  APIResponse.success(res, 'Associated persons retrieved successfully', result);
};

export const getAssociatedPerson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { associatedPersonId } = req.params as { associatedPersonId: string };

  const result = await associatedPersonService.getAssociatedPerson(
    authReq.customerId!,
    associatedPersonId,
  );

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.ASSOCIATED_PERSON_VIEWED,
    category: ActivityCategory.KYB,
    detail: 'Associated person viewed',
    metadata: { associatedPersonId },
  });

  APIResponse.success(res, 'Associated person retrieved successfully', result);
};

export const updateAssociatedPerson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  guardKybStatus(authReq);

  const { associatedPersonId } = req.params as { associatedPersonId: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const body = req.body as UpdateAssociatedPersonRequest;

  let apiBody = body;
  if (body.poa || body.identifying_information) {
    apiBody = await convertPersonFilesToBase64(body as AssociatedPerson);
  }

  const result = await associatedPersonService.updateAssociatedPerson(
    authReq.customerId!,
    associatedPersonId,
    apiBody,
    idempotencyKey,
  );

  const localRecord = await associatedPersonRepository.findByOneMoneyId(associatedPersonId);
  if (localRecord) {
    const updateData: Record<string, unknown> = {};
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.middle_name !== undefined) updateData.middleName = body.middle_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.birth_date !== undefined) updateData.birthDate = body.birth_date;
    if (body.primary_nationality !== undefined) updateData.primaryNationality = body.primary_nationality;
    if (body.has_ownership !== undefined) updateData.hasOwnership = body.has_ownership;
    if (body.ownership_percentage !== undefined) updateData.ownershipPercentage = body.ownership_percentage;
    if (body.has_control !== undefined) updateData.hasControl = body.has_control;
    if (body.is_signer !== undefined) updateData.isSigner = body.is_signer;
    if (body.is_director !== undefined) updateData.isDirector = body.is_director;
    if (body.country_of_tax !== undefined) updateData.countryOfTax = body.country_of_tax;
    if (body.tax_type !== undefined) updateData.taxType = body.tax_type;
    if (body.tax_id !== undefined) updateData.taxId = body.tax_id;
    if (body.poa !== undefined) updateData.poa = body.poa;
    if (body.poa_type !== undefined) updateData.poaType = body.poa_type;
    if (body.residential_address) {
      updateData.residentialAddressStreetLine1 = body.residential_address.street_line_1;
      updateData.residentialAddressStreetLine2 = body.residential_address.street_line_2;
      updateData.residentialAddressCity = body.residential_address.city;
      updateData.residentialAddressState = body.residential_address.state;
      updateData.residentialAddressCountry = body.residential_address.country;
      updateData.residentialAddressSubdivision = body.residential_address.subdivision;
      updateData.residentialAddressPostalCode = body.residential_address.postal_code;
    }

    const identifyingDocuments = body.identifying_information
      ? body.identifying_information.map((doc) => ({
          type: doc.type,
          issuingCountry: doc.issuing_country,
          nationalIdentityNumber: doc.national_identity_number,
          imageFrontUrl: doc.image_front,
          imageBackUrl: doc.image_back,
        }))
      : undefined;

    await associatedPersonRepository.updateWithDocuments(
      localRecord.id,
      updateData,
      identifyingDocuments,
    );
  }

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.ASSOCIATED_PERSON_UPDATED,
    category: ActivityCategory.KYB,
    detail: 'Associated person updated',
    metadata: { associatedPersonId },
  });

  APIResponse.success(res, 'Associated person updated successfully', result);
};

export const deleteAssociatedPerson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  guardKybStatus(authReq);

  const { associatedPersonId } = req.params as { associatedPersonId: string };
  const idempotencyKey = req.headers['idempotency-key'] as string;

  await associatedPersonService.deleteAssociatedPerson(
    authReq.customerId!,
    associatedPersonId,
    idempotencyKey,
  );

  const localRecord = await associatedPersonRepository.findByOneMoneyId(associatedPersonId);
  if (localRecord) {
    await associatedPersonRepository.deleteById(localRecord.id);
  }

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.ASSOCIATED_PERSON_DELETED,
    category: ActivityCategory.KYB,
    detail: 'Associated person deleted',
    metadata: { associatedPersonId },
  });

  APIResponse.success(res, 'Associated person deleted successfully');
};
