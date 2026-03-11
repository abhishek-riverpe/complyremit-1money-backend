import Joi from 'joi';

export const TAX_TYPES = [
  'SSN', 'EIN', 'TFN', 'ABN', 'ACN', 'UTR', 'NINO', 'NRIC', 'FIN', 'ASDG',
  'ITR', 'NIF', 'TIN', 'VAT', 'CUIL', 'CUIT', 'DNI', 'BIN', 'UNP', 'RNPM',
  'NIT', 'CPF', 'CNPJ', 'NIRE', 'UCN', 'UIC', 'SIN', 'BN', 'RUT', 'IIN',
  'USCC', 'CNOC', 'USCN', 'ITIN', 'CPJ', 'OIB', 'DIC', 'CPR', 'CVR', 'CN',
  'RNC', 'RUC', 'TN', 'HETU', 'YT', 'ALV', 'SIREN', 'IDNR', 'STNR', 'VTA',
  'HKID', 'AJ', 'EN', 'KN', 'VSK', 'PAN', 'GSTN', 'NIK', 'NPWP', 'PPS',
  'TRN', 'CRO', 'CHY', 'CF', 'IVA', 'IN', 'JCT', 'EDRPOU', 'EID',
] as const;

export const ID_TYPES = [
  'drivers_license',
  'permanent_residency_id',
  'national_id',
  'passport',
  'other',
] as const;

export const POA_TYPES = [
  'utility_bill',
  'bank_statement',
  'tax_return',
  'government_letter',
  'rental_agreement',
  'mortgage_statement',
  'insurance_document',
  'other',
] as const;

// Path parameter validation schemas
export const associatedPersonIdParamSchema = Joi.object({
  associatedPersonId: Joi.string().max(100).pattern(/^[a-zA-Z0-9_\-]+$/).required(),
});

export const sessionTokenParamSchema = Joi.object({
  sessionToken: Joi.string().max(200).pattern(/^[a-zA-Z0-9_\-]+$/).required(),
});

export const ruleIdParamSchema = Joi.object({
  ruleId: Joi.string().max(100).pattern(/^[a-zA-Z0-9_\-]+$/).required(),
});

export const ruleOrderParamSchema = Joi.object({
  ruleId: Joi.string().max(100).pattern(/^[a-zA-Z0-9_\-]+$/).required(),
  orderId: Joi.string().max(100).pattern(/^[a-zA-Z0-9_\-]+$/).required(),
});

export const idempotencyKeyParamSchema = Joi.object({
  idempotencyKey: Joi.string().max(200).pattern(/^[a-zA-Z0-9_\-]+$/).required(),
});

export const addressSchema = Joi.object({
  street_line_1: Joi.string().max(200).required(),
  street_line_2: Joi.string().max(200).optional(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  country: Joi.string().length(3).required(),
  subdivision: Joi.string().max(100).optional(),
  postal_code: Joi.string().max(20).optional(),
});

export const identifyingInfoSchema = Joi.object({
  type: Joi.string().valid(...ID_TYPES).required(),
  issuing_country: Joi.string().length(3).required(),
  national_identity_number: Joi.string().max(100).required(),
  image_front: Joi.string().required(),
  image_back: Joi.string().required(),
});

export const associatedPersonSchema = Joi.object({
  first_name: Joi.string().max(100).required(),
  middle_name: Joi.string().max(100).allow('').optional(),
  last_name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  residential_address: addressSchema.required(),
  birth_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  primary_nationality: Joi.string().length(3).required(),
  has_ownership: Joi.boolean().required(),
  ownership_percentage: Joi.number().min(0).max(100).when('has_ownership', {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.number().optional(),
  }),
  has_control: Joi.boolean().required(),
  is_signer: Joi.boolean().required(),
  is_director: Joi.boolean().required(),
  identifying_information: Joi.array().items(identifyingInfoSchema).min(1).required(),
  country_of_tax: Joi.string().length(3).required(),
  tax_type: Joi.string().valid(...TAX_TYPES).required(),
  tax_id: Joi.string().max(100).required().custom((value, helpers) => {
    const taxType = helpers.state.ancestors[0].tax_type;
    if (taxType === 'SSN') {
      const digits = value.replace(/\D/g, '');
      if (!/^\d{9}$/.test(digits)) {
        return helpers.error('any.invalid', { message: 'SSN must contain exactly 9 digits' });
      }
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    if (taxType === 'EIN') {
      const digits = value.replace(/\D/g, '');
      if (!/^\d{9}$/.test(digits)) {
        return helpers.error('any.invalid', { message: 'EIN must contain exactly 9 digits' });
      }
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return value;
  }).messages({
    'any.invalid': '{{#message}}',
  }),
  poa: Joi.string().required(),
  poa_type: Joi.string().valid(...POA_TYPES).required(),
});
