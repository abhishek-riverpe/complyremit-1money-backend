import Joi from 'joi';

export const createAutoConversionRuleSchema = Joi.object({
  source: Joi.object({
    asset: Joi.string().required(),
    network: Joi.string().required(),
  }).required(),
  destination: Joi.object({
    asset: Joi.string().required(),
    network: Joi.string().optional(),
    wallet_address: Joi.string().optional(),
    external_account_id: Joi.string().optional(),
  }).required(),
});

export const listAutoConversionRulesSchema = Joi.object({
  page_size: Joi.number().integer().optional(),
  page_num: Joi.number().integer().optional(),
});
