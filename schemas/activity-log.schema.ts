import Joi from "joi";

export const getActivitySchema = Joi.object({
  category: Joi.string()
    .valid("auth", "kyb", "storage", "conversion", "deposit", "transaction", "profile")
    .optional(),
  cursor: Joi.string().uuid().optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
}).options({ stripUnknown: true });
