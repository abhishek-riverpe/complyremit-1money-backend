import Joi from 'joi';

export const uploadUrlSchema = Joi.object({
  fileName: Joi.string().max(255).required(),
  contentType: Joi.string().max(100).required(),
  category: Joi.string().valid('business_document', 'id_front', 'id_back', 'poa').required(),
}).options({ stripUnknown: true });
