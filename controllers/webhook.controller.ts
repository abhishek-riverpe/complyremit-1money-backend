import type { Request, Response } from 'express';
import APIResponse from '../lib/APIResponse';
import { processWebhookEvent } from '../services/webhook.service';

export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
  const eventId = req.header('X-Webhook-Event-Id');
  const eventName = req.header('X-Webhook-Event-Name');
  const deliveryId = req.header('X-Webhook-Delivery-Id');
  const timestampHeader = req.header('X-Webhook-Timestamp');

  if (!eventId || !eventName || !timestampHeader) {
    return APIResponse.error(res, 400, 'Missing required webhook headers');
  }

  const timestamp = Number(timestampHeader);
  if (Number.isNaN(timestamp)) {
    return APIResponse.error(res, 400, 'Invalid webhook timestamp');
  }

  try {
    const result = await processWebhookEvent(
      {
        eventId,
        eventName,
        deliveryId: deliveryId ?? undefined,
        timestamp,
      },
      req.body,
      { ip: req.ip, headers: req.headers },
    );

    if (result.alreadyProcessed) {
      return APIResponse.success(res, 'Webhook already processed');
    }

    return APIResponse.success(res, 'Webhook processed successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return APIResponse.error(res, 500, `Failed to process webhook: ${message}`);
  }
};
