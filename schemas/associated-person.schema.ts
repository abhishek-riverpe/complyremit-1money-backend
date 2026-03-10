import Joi from 'joi';
import {
  TAX_TYPES,
  ID_TYPES,
  POA_TYPES,
  addressSchema,
  identifyingInfoSchema,
  associatedPersonSchema,
} from './shared';

export const createAssociatedPersonSchema = associatedPersonSchema
  .options({ stripUnknown: true });

export const updateAssociatedPersonSchema = Joi.object({
  first_name: Joi.string().max(100).optional(),
  middle_name: Joi.string().max(100).allow('').optional(),
  last_name: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  residential_address: addressSchema.optional(),
  birth_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  primary_nationality: Joi.string().length(3).optional(),
  has_ownership: Joi.boolean().optional(),
  ownership_percentage: Joi.number().min(0).max(100).optional(),
  has_control: Joi.boolean().optional(),
  is_signer: Joi.boolean().optional(),
  is_director: Joi.boolean().optional(),
  identifying_information: Joi.array().items(identifyingInfoSchema).min(1).optional(),
  country_of_tax: Joi.string().length(3).optional(),
  tax_type: Joi.string().valid(...TAX_TYPES).optional(),
  tax_id: Joi.string().max(100).optional(),
  poa: Joi.string().optional(),
  poa_type: Joi.string().valid(...POA_TYPES).optional(),
}).min(1).options({ stripUnknown: true });
