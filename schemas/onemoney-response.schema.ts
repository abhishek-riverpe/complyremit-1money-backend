import Joi from 'joi';

const addressResponseSchema = Joi.object({
  street_line_1: Joi.string().required(),
  street_line_2: Joi.string().optional().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  subdivision: Joi.string().optional().allow('', null),
  postal_code: Joi.string().optional().allow('', null),
}).options({ stripUnknown: true });

const associatedPersonResponseSchema = Joi.object({
  associated_person_id: Joi.string().required(),
  email: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
}).options({ stripUnknown: true });

export const customerResponseSchema = Joi.object({
  customer_id: Joi.string().required(),
  status: Joi.string().required(),
  email: Joi.string().required(),
  business_legal_name: Joi.string().required(),
  business_description: Joi.string().optional().allow('', null),
  business_type: Joi.string().required(),
  business_industry: Joi.string().required(),
  business_registration_number: Joi.string().optional().allow('', null),
  date_of_incorporation: Joi.string().required(),
  registered_address: addressResponseSchema.required(),
  primary_website: Joi.string().optional().allow('', null),
  publicly_traded: Joi.boolean().required(),
  tax_id: Joi.string().required(),
  tax_type: Joi.string().required(),
  tax_country: Joi.string().required(),
  submitted_at: Joi.string().optional().allow(null),
  created_at: Joi.string().required(),
  updated_at: Joi.string().required(),
  associated_persons: Joi.array()
    .items(associatedPersonResponseSchema)
    .required(),
}).options({ stripUnknown: true });

export const createTosLinkResponseSchema = Joi.object({
  url: Joi.string().required(),
  session_token: Joi.string().required(),
}).options({ stripUnknown: true });

export const signTosResponseSchema = Joi.object({
  signed_agreement_id: Joi.string().required(),
}).options({ stripUnknown: true });
