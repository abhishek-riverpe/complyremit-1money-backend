import { prisma } from '../lib/prisma';
import type { CreateCustomerRequest } from '../types/onemoney-customer.types';
import type { BusinessType, AccountPurpose, SourceOfFunds, SourceOfWealth, DocType } from '../generated/prisma/client';
import type {
  UpdateBusinessData,
  CreateAssociatedPersonData,
  CreateBusinessDocumentData,
} from '../types/user.types';

export const persistBusinessData = async (
  userId: string,
  clerkUserId: string,
  body: CreateCustomerRequest,
  paymentAccount?: { oneMoneyCustomerId: string; oneMoneyKybStatus: string },
): Promise<void> => {
  const businessData: UpdateBusinessData = {
    businessLegalName: body.business_legal_name,
    businessDescription: body.business_description,
    businessType: body.business_type as BusinessType,
    businessIndustry: body.business_industry,
    businessRegistrationNumber: body.business_registration_number,
    dateOfIncorporation: body.date_of_incorporation,
    primaryWebsite: body.primary_website,
    publiclyTraded: body.publicly_traded,
    taxId: body.tax_id,
    taxType: body.tax_type,
    taxCountry: body.tax_country,
    accountPurpose: body.account_purpose as AccountPurpose,
    sourceOfFunds: body.source_of_funds as SourceOfFunds[],
    sourceOfWealth: body.source_of_wealth as SourceOfWealth[],
    estimatedAnnualRevenueUsd: body.estimated_annual_revenue_usd,
    expectedMonthlyFiatDeposits: body.expected_monthly_fiat_deposits,
    expectedMonthlyFiatWithdrawals: body.expected_monthly_fiat_withdrawals,
    registeredAddressStreetLine1: body.registered_address.street_line_1,
    registeredAddressStreetLine2: body.registered_address.street_line_2,
    registeredAddressCity: body.registered_address.city,
    registeredAddressState: body.registered_address.state,
    registeredAddressCountry: body.registered_address.country,
    registeredAddressSubdivision: body.registered_address.subdivision,
    registeredAddressPostalCode: body.registered_address.postal_code,
    signedAgreementId: body.signed_agreement_id,
  };

  const persons: CreateAssociatedPersonData[] = body.associated_persons.map((p) => ({
    firstName: p.first_name,
    middleName: p.middle_name,
    lastName: p.last_name,
    email: p.email,
    birthDate: p.birth_date,
    primaryNationality: p.primary_nationality,
    hasOwnership: p.has_ownership,
    ownershipPercentage: p.ownership_percentage,
    hasControl: p.has_control,
    isSigner: p.is_signer,
    isDirector: p.is_director,
    countryOfTax: p.country_of_tax,
    taxType: p.tax_type,
    taxId: p.tax_id,
    poa: p.poa,
    poaType: p.poa_type,
    residentialAddressStreetLine1: p.residential_address.street_line_1,
    residentialAddressStreetLine2: p.residential_address.street_line_2,
    residentialAddressCity: p.residential_address.city,
    residentialAddressState: p.residential_address.state,
    residentialAddressCountry: p.residential_address.country,
    residentialAddressSubdivision: p.residential_address.subdivision,
    residentialAddressPostalCode: p.residential_address.postal_code,
    identifyingDocuments: p.identifying_information.map((doc) => ({
      type: doc.type,
      issuingCountry: doc.issuing_country,
      nationalIdentityNumber: doc.national_identity_number,
      imageFrontUrl: doc.image_front,
      imageBackUrl: doc.image_back,
    })),
  }));

  const documents: CreateBusinessDocumentData[] = body.documents.map((d) => ({
    docType: d.doc_type as DocType,
    fileUrl: d.file,
    description: d.description,
  }));

  await prisma.$transaction(async (tx) => {
    // Update user with business fields (and payment account if provided)
    await tx.user.update({
      where: { clerkUserId },
      data: { ...businessData, ...paymentAccount },
    });

    // Create associated persons with nested identifying documents
    for (const person of persons) {
      const { identifyingDocuments, ...personData } = person;
      await tx.associatedPerson.create({
        data: {
          ...personData,
          userId,
          identifyingDocuments: {
            create: identifyingDocuments,
          },
        },
      });
    }

    // Create business documents
    for (const doc of documents) {
      await tx.businessDocument.create({
        data: { ...doc, userId },
      });
    }
  });
};
