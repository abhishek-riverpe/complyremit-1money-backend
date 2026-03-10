import Joi from 'joi';
import { TAX_TYPES, addressSchema, associatedPersonSchema } from './shared';

const REVENUE_RANGES = [
  '0_99999',
  '100000_999999',
  '1000000_9999999',
  '10000000_49999999',
  '50000000_249999999',
  '2500000000_plus',
] as const;

const BUSINESS_TYPES = [
  'corporation',
  'llc',
  'partnership',
  'sole_proprietorship',
  'investment_fund',
  'societies',
  'trust',
  'government',
  'dao',
] as const;

const ACCOUNT_PURPOSES = [
  'charitable_donations',
  'ecommerce_retail_payments',
  'investment_purposes',
  'other',
  'payments_to_friends_or_family_abroad',
  'payroll',
  'personal_or_living_expenses',
  'protect_wealth',
  'purchase_goods_and_services',
  'receive_payments_for_goods_and_services',
  'tax_optimization',
  'third_party_money_transmission',
  'treasury_management',
] as const;

const SOURCE_OF_FUNDS = [
  'business_loans',
  'grants',
  'inter_company_funds',
  'investment_proceeds',
  'legal_settlement',
  'owners_capital',
  'pension_retirement',
  'sale_of_assets',
  'sales_of_goods_and_services',
  'tax_refund',
  'third_party_funds',
  'treasury_reserves',
] as const;

const SOURCE_OF_WEALTH = [
  'business_dividends_or_profits',
  'investments',
  'asset_sales',
  'client_investor_contributions',
  'gambling',
  'charitable_contributions',
  'inheritance',
  'affiliate_or_royalty_income',
] as const;

const DOC_TYPES = [
  'aml_comfort_letter',
  'constitutional_document',
  'directors_registry',
  'cert_of_incumbency',
  'e_signature_certificate',
  'evidence_of_good_standing',
  'flow_of_funds',
  'formation_document',
  'marketing_materials',
  'other',
  'ownership_chart',
  'ownership_information',
  'proof_of_account_purpose',
  'proof_of_address',
  'proof_of_entity_name_change',
  'proof_of_nature_of_business',
  'proof_of_nature_of_business_license',
  'proof_of_nature_of_business_aml_policy',
  'proof_of_signatory_authority',
  'proof_of_source_of_funds',
  'proof_of_source_of_wealth',
  'proof_of_tax_identification',
  'registration_document',
  'shareholder_register',
  'evidence_of_directors_and_controllers',
  'tax_exempt_entity_confirmation',
] as const;

const documentSchema = Joi.object({
  doc_type: Joi.string().valid(...DOC_TYPES).required(),
  file: Joi.string().required(),
  description: Joi.string().max(500).optional(),
});

export const createCustomerSchema = Joi.object({
  email: Joi.string().email().required(),
  business_legal_name: Joi.string().max(200).required(),
  business_description: Joi.string().max(500).required(),
  business_type: Joi.string().valid(...BUSINESS_TYPES).required(),
  business_industry: Joi.string().max(100).required(),
  business_registration_number: Joi.string().max(100).optional(),
  date_of_incorporation: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  registered_address: addressSchema.required(),
  primary_website: Joi.string().uri().max(500).optional(),
  publicly_traded: Joi.boolean().required(),
  tax_id: Joi.string().max(100).required(),
  tax_type: Joi.string().valid(...TAX_TYPES).required(),
  tax_country: Joi.string().length(3).required(),
  signed_agreement_id: Joi.string().uuid().required(),
  associated_persons: Joi.array().items(associatedPersonSchema).min(1).required(),
  documents: Joi.array().items(documentSchema).min(1).required(),
  account_purpose: Joi.string().valid(...ACCOUNT_PURPOSES).required(),
  source_of_funds: Joi.array().items(Joi.string().valid(...SOURCE_OF_FUNDS)).min(1).required(),
  source_of_wealth: Joi.array().items(Joi.string().valid(...SOURCE_OF_WEALTH)).min(1).required(),
  estimated_annual_revenue_usd: Joi.string().valid(...REVENUE_RANGES).required(),
  expected_monthly_fiat_deposits: Joi.string().valid(...REVENUE_RANGES).required(),
  expected_monthly_fiat_withdrawals: Joi.string().valid(...REVENUE_RANGES).required(),
}).options({ stripUnknown: true });

export const updateCustomerSchema = Joi.object({
  email: Joi.string().email().optional(),
  business_legal_name: Joi.string().max(200).optional(),
  business_description: Joi.string().max(500).optional(),
  business_type: Joi.string().valid(...BUSINESS_TYPES).optional(),
  business_industry: Joi.string().max(100).optional(),
  business_registration_number: Joi.string().max(100).optional(),
  date_of_incorporation: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  registered_address: addressSchema.optional(),
  primary_website: Joi.string().uri().max(500).optional(),
  publicly_traded: Joi.boolean().optional(),
  tax_id: Joi.string().max(100).optional(),
  tax_type: Joi.string().valid(...TAX_TYPES).optional(),
  tax_country: Joi.string().length(3).optional(),
}).options({ stripUnknown: true });

export const createTosLinkSchema = Joi.object({
  redirect_url: Joi.string().uri().required(),
}).options({ stripUnknown: true });
