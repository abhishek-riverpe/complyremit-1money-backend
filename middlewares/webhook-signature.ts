import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import AppError from '../lib/AppError';

const FIVE_MINUTES_IN_SECONDS = 300;

export default function verifyWebhookSignature(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const signature = req.header('X-Webhook-Signature');
  const timestampHeader = req.header('X-Webhook-Timestamp');
  const eventId = req.header('X-Webhook-Event-Id');

  if (!signature || !timestampHeader || !eventId) {
    return next(new AppError(401, 'Missing required webhook signature headers.'));
  }

  const timestamp = Number(timestampHeader);
  const now = Math.floor(Date.now() / 1000);
  if (Number.isNaN(timestamp) || Math.abs(now - timestamp) > FIVE_MINUTES_IN_SECONDS) {
    return next(new AppError(401, 'Invalid or expired webhook timestamp.'));
  }

  const rawBody = (req as any).rawBody ?? JSON.stringify(req.body ?? {});
  const signedPayload = `${timestamp}.${rawBody}`;

  const secret = process.env.ONEMONEY_WEBHOOK_SECRET;
  if (!secret) {
    return next(new AppError(500, 'Webhook secret not configured.'));
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return next(new AppError(401, 'Invalid webhook signature.'));
  }

  next();
}
