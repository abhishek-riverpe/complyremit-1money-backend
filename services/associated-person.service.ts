import { oneMoneyClient } from '../lib/onemoney-client';
import type {
  CreateAssociatedPersonRequest,
  UpdateAssociatedPersonRequest,
  AssociatedPersonResponse,
} from '../types/associated-person.types';

export const createAssociatedPerson = async (
  customerId: string,
  body: CreateAssociatedPersonRequest,
  idempotencyKey: string,
): Promise<AssociatedPersonResponse> => {
  return oneMoneyClient.post(
    `/v1/customers/${customerId}/associated-persons`,
    body,
    idempotencyKey,
  );
};

export const listAssociatedPersons = async (
  customerId: string,
): Promise<AssociatedPersonResponse[]> => {
  return oneMoneyClient.get(`/v1/customers/${customerId}/associated-persons`);
};

export const getAssociatedPerson = async (
  customerId: string,
  personId: string,
): Promise<AssociatedPersonResponse> => {
  return oneMoneyClient.get(
    `/v1/customers/${customerId}/associated-persons/${personId}`,
  );
};

export const updateAssociatedPerson = async (
  customerId: string,
  personId: string,
  body: UpdateAssociatedPersonRequest,
  idempotencyKey: string,
): Promise<AssociatedPersonResponse> => {
  return oneMoneyClient.put(
    `/v1/customers/${customerId}/associated-persons/${personId}`,
    body,
    idempotencyKey,
  );
};

export const deleteAssociatedPerson = async (
  customerId: string,
  personId: string,
  idempotencyKey: string,
): Promise<void> => {
  return oneMoneyClient.delete(
    `/v1/customers/${customerId}/associated-persons/${personId}`,
    idempotencyKey,
  );
};
