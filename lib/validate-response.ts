import type { ObjectSchema } from 'joi';
import AppError from './AppError';
import logger from './logger';

export function validateUpstreamResponse<T>(
  data: unknown,
  schema: ObjectSchema,
  context: string,
): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    logger.error('Upstream response validation failed', {
      context,
      fields: error.details.map((d) => ({
        path: d.path.join('.'),
        message: d.message,
        type: d.type,
      })),
    });
    throw AppError.badGateway(
      'Unexpected response from payment provider. Please try again later.',
    );
  }

  return value as T;
}
