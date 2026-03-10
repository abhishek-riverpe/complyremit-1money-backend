import type { AssociatedPerson } from './onemoney-customer.types';

export type CreateAssociatedPersonRequest = AssociatedPerson;

export type UpdateAssociatedPersonRequest = Partial<AssociatedPerson>;

export interface AssociatedPersonResponse {
  associated_person_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  residential_address: {
    street_line_1: string;
    street_line_2?: string;
    city: string;
    state: string;
    country: string;
    subdivision?: string;
    postal_code?: string;
  };
  birth_date: string;
  primary_nationality: string;
  has_ownership: boolean;
  ownership_percentage?: number;
  has_control: boolean;
  is_signer: boolean;
  is_director: boolean;
  identifying_information: Array<{
    type: string;
    issuing_country: string;
    national_identity_number: string;
    image_front: string;
    image_back: string;
  }>;
  country_of_tax: string;
  tax_type: string;
  tax_id: string;
  poa: string;
  poa_type: string;
  created_at: string;
  updated_at: string;
}
