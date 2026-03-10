import type { BusinessType, AccountPurpose, SourceOfFunds, SourceOfWealth, DocType } from '../generated/prisma/client';

export interface CreateUserData {
  clerkUserId: string;
  email: string;
}

export interface UpdateUserData {
  oneMoneyCustomerId?: string;
  oneMoneyKybStatus?: string;
}

export interface UpdateBusinessData {
  businessLegalName?: string;
  businessDescription?: string;
  businessType?: BusinessType;
  businessIndustry?: string;
  businessRegistrationNumber?: string;
  dateOfIncorporation?: string;
  primaryWebsite?: string;
  publiclyTraded?: boolean;
  taxId?: string;
  taxType?: string;
  taxCountry?: string;
  accountPurpose?: AccountPurpose;
  sourceOfFunds?: SourceOfFunds[];
  sourceOfWealth?: SourceOfWealth[];
  estimatedAnnualRevenueUsd?: string;
  expectedMonthlyFiatDeposits?: string;
  expectedMonthlyFiatWithdrawals?: string;
  registeredAddressStreetLine1?: string;
  registeredAddressStreetLine2?: string;
  registeredAddressCity?: string;
  registeredAddressState?: string;
  registeredAddressCountry?: string;
  registeredAddressSubdivision?: string;
  registeredAddressPostalCode?: string;
  signedAgreementId?: string;
}

export interface CreateAssociatedPersonData {
  oneMoneyAssociatedPersonId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthDate: string;
  primaryNationality: string;
  hasOwnership: boolean;
  ownershipPercentage?: number;
  hasControl: boolean;
  isSigner: boolean;
  isDirector: boolean;
  countryOfTax: string;
  taxType: string;
  taxId: string;
  poa?: string;
  poaType?: string;
  residentialAddressStreetLine1: string;
  residentialAddressStreetLine2?: string;
  residentialAddressCity: string;
  residentialAddressState: string;
  residentialAddressCountry: string;
  residentialAddressSubdivision?: string;
  residentialAddressPostalCode?: string;
  identifyingDocuments: CreateIdentifyingDocumentData[];
}

export interface CreateIdentifyingDocumentData {
  type: string;
  issuingCountry: string;
  nationalIdentityNumber: string;
  imageFrontUrl?: string;
  imageBackUrl?: string;
}

export interface CreateBusinessDocumentData {
  docType: DocType;
  fileUrl: string;
  description?: string;
}
