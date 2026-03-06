export interface OneMoneyAddress {
  street_line_1: string;
  street_line_2?: string;
  city: string;
  state: string;
  country: string;
  subdivision?: string;
  postal_code?: string;
}

export interface IdentifyingInfo {
  type: string;
  issuing_country: string;
  national_identity_number: string;
  image_front: string;
  image_back: string;
}

export interface AssociatedPerson {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  residential_address: OneMoneyAddress;
  birth_date: string;
  primary_nationality: string;
  has_ownership: boolean;
  ownership_percentage?: number;
  has_control: boolean;
  is_signer: boolean;
  is_director: boolean;
  identifying_information: IdentifyingInfo[];
  country_of_tax: string;
  tax_type: string;
  tax_id: string;
  poa: string;
  poa_type: string;
}

export interface BusinessDocument {
  doc_type: string;
  file: string;
  description?: string;
}

export interface CreateCustomerRequest {
  email: string;
  business_legal_name: string;
  business_description: string;
  business_type: string;
  business_industry: string;
  business_registration_number?: string;
  date_of_incorporation: string;
  registered_address: OneMoneyAddress;
  primary_website?: string;
  publicly_traded: boolean;
  tax_id: string;
  tax_type: string;
  tax_country: string;
  signed_agreement_id: string;
  associated_persons: AssociatedPerson[];
  documents: BusinessDocument[];
  account_purpose: string;
  source_of_funds: string[];
  source_of_wealth: string[];
  estimated_annual_revenue_usd: string;
  expected_monthly_fiat_deposits: string;
  expected_monthly_fiat_withdrawals: string;
}

export interface UpdateCustomerRequest {
  email?: string;
  business_legal_name?: string;
  business_description?: string;
  business_type?: string;
  business_industry?: string;
  business_registration_number?: string;
  date_of_incorporation?: string;
  registered_address?: OneMoneyAddress;
  primary_website?: string;
  publicly_traded?: boolean;
  tax_id?: string;
  tax_type?: string;
  tax_country?: string;
}

export interface CustomerResponse {
  customer_id: string;
  email: string;
  business_legal_name: string;
  business_description: string;
  business_type: string;
  business_industry: string;
  business_registration_number: string;
  date_of_incorporation: string;
  registered_address: OneMoneyAddress;
  primary_website?: string;
  publicly_traded: boolean;
  tax_id: string;
  tax_type: string;
  tax_country: string;
  status: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

// TOS Types
export interface CreateTosLinkRequest {
  redirect_url: string;
}

export interface CreateTosLinkResponse {
  session_token: string;
}

export interface SignTosResponse {
  signed_agreement_id: string;
}
