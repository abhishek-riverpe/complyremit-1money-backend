import Joi from 'joi';

const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const uploadUrlSchema = Joi.object({
  fileName: Joi.string().max(255).required(),
  contentType: Joi.string().valid(...ALLOWED_CONTENT_TYPES).required(),
  category: Joi.string().valid('business_document', 'id_front', 'id_back', 'poa').required(),
}).options({ stripUnknown: true });

export const downloadUrlSchema = Joi.object({
  objectKey: Joi.string().max(500).required(),
}).options({ stripUnknown: true });
