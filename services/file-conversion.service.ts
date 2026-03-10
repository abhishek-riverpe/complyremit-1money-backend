import { fetchAsBase64 } from './storage.service';
import type { CreateCustomerRequest, AssociatedPerson } from '../types/onemoney-customer.types';

export const convertPersonFilesToBase64 = async (
  person: AssociatedPerson,
): Promise<AssociatedPerson> => ({
  ...person,
  poa: await fetchAsBase64(person.poa),
  identifying_information: await Promise.all(
    person.identifying_information.map(async (doc) => ({
      ...doc,
      image_front: await fetchAsBase64(doc.image_front),
      image_back: await fetchAsBase64(doc.image_back),
    })),
  ),
});

export const convertFilesToBase64 = async (
  body: CreateCustomerRequest,
): Promise<CreateCustomerRequest> => {
  const persons = await Promise.all(
    body.associated_persons.map(async (person) => ({
      ...person,
      poa: await fetchAsBase64(person.poa),
      identifying_information: await Promise.all(
        person.identifying_information.map(async (doc) => ({
          ...doc,
          image_front: await fetchAsBase64(doc.image_front),
          image_back: await fetchAsBase64(doc.image_back),
        })),
      ),
    })),
  );

  const documents = await Promise.all(
    body.documents.map(async (doc) => ({
      ...doc,
      file: await fetchAsBase64(doc.file),
    })),
  );

  return { ...body, associated_persons: persons, documents };
};
