import Joi from 'joi';

export const webhookSchema = Joi.object({
  event_name: Joi.string().required(),
  resource: Joi.object({
    type: Joi.string().required(),
    id: Joi.string().required(),
  }).required(),
  data: Joi.object().required(),
}).required();
