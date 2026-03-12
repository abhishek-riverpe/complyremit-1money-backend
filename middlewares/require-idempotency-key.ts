import { createHash } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import AppError from '../lib/AppError';
import { prisma } from '../lib/prisma';
import type { AuthRequest } from './auth';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const TTL_HOURS = 24;
const CLEANUP_PROBABILITY = 0.01;

function hashBody(body: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(body || {}))
    .digest('hex');
}

export default async function requireIdempotencyKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 1. Validate key exists and is valid UUID
  const key = req.headers['idempotency-key'] as string;
  if (!key) {
    return next(new AppError(400, 'Idempotency-Key header is required'));
  }
  if (!UUID_REGEX.test(key)) {
    return next(new AppError(400, 'Idempotency-Key must be a valid UUID'));
  }

  // 2. Extract context
  const userId = (req as AuthRequest).dbUser!.id;
  const operation = `${req.method} ${req.baseUrl}${req.path}`;
  const bodyHash = hashBody(req.body);

  try {
    // 3. Look up existing record
    const existing = await prisma.idempotencyKey.findUnique({
      where: { userId_key_operation: { userId, key, operation } },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        // 4. Completed: compare body hash, return cached response
        if (existing.bodyHash !== bodyHash) {
          return next(
            new AppError(
              422,
              'Idempotency-Key has already been used with a different request body',
            ),
          );
        }
        res.status(existing.statusCode!).json(existing.response);
        return;
      }

      // 5. Pending: check staleness
      const age = Date.now() - existing.createdAt.getTime();
      if (age > STALE_THRESHOLD_MS) {
        // Stale lock — delete and proceed
        await prisma.idempotencyKey.delete({ where: { id: existing.id } });
      } else {
        return next(
          new AppError(409, 'A request with this Idempotency-Key is already in progress'),
        );
      }
    }

    // 6. Insert PENDING record (unique constraint catches races)
    try {
      await prisma.idempotencyKey.create({
        data: {
          userId,
          key,
          operation,
          bodyHash,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000),
        },
      });
    } catch (err: any) {
      // Unique constraint violation = concurrent request
      if (err?.code === 'P2002') {
        return next(
          new AppError(409, 'A request with this Idempotency-Key is already in progress'),
        );
      }
      throw err;
    }

    // 7. Patch res.json() to capture the response
    const originalJson = res.json.bind(res);
    res.json = function patchedJson(body: any) {
      const statusCode = res.statusCode;

      if (statusCode >= 200 && statusCode < 300) {
        // Success: mark COMPLETED and cache
        prisma.idempotencyKey
          .update({
            where: { userId_key_operation: { userId, key, operation } },
            data: { status: 'COMPLETED', statusCode, response: body },
          })
          .catch(() => {});
      } else {
        // Error: delete PENDING record so retry is allowed
        prisma.idempotencyKey
          .delete({
            where: { userId_key_operation: { userId, key, operation } },
          })
          .catch(() => {});
      }

      return originalJson(body);
    };

    // 8. Lazy cleanup with ~1% probability
    if (Math.random() < CLEANUP_PROBABILITY) {
      prisma.idempotencyKey
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(() => {});
    }

    next();
  } catch (error) {
    next(error);
  }
}
