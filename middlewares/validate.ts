import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';
import AppError from '../lib/AppError';

type Source = 'body' | 'params' | 'query';

const validate =
  (schema: ObjectSchema, source: Source = 'body') =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(400, message));
    }

    if (source !== 'query') {
      req[source] = value;
    }
    next();
  };

export default validate;
