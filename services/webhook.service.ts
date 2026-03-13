import logger from '../lib/logger';
import webhookRepository from '../repositories/webhook.repository';
import userRepository from '../repositories/user.repository';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';
import { log, buildContext } from './activity-log.service';

export interface WebhookHeaders {
  eventId: string;
  eventName: string;
  deliveryId?: string;
  timestamp: number;
}

export interface WebhookContext {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}

const KYB_EVENT_TO_STATUS: Record<string, string> = {
  'kyb.pending': 'PENDING',
  'kyb.additional_info_required': 'PENDING_RESPONSE',
  'kyb.completed': 'APPROVED',
  'kyb.rejected': 'REJECTED',
};

export const processWebhookEvent = async (
  headers: WebhookHeaders,
  payload: any,
  context?: WebhookContext,
) => {
  const { eventId, eventName, deliveryId } = headers;
  const existing = await webhookRepository.findByEventId(eventId);

  if (existing) {
    logger.info('Duplicate webhook event received, skipping', { eventId, eventName });
    return { alreadyProcessed: true };
  }

  // Attempt counter will start at 1
  const attempt = 1;

  await webhookRepository.create({
    eventId,
    deliveryId,
    eventName,
    payload,
    status: 'PENDING',
    attempts: attempt,
  });

  try {
    // Customer KYB status updates
    if (KYB_EVENT_TO_STATUS[eventName]) {
      await handleKybEvent(eventName, payload, context);
    }

    // NOTE: We keep auto conversion and deposit events only as audit records.
    // If needed in the future, we can add dedicated tables.

    await webhookRepository.markProcessed(eventId, 'SUCCESS', { attempts: attempt });

    return { alreadyProcessed: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to process webhook event', { eventId, eventName, error: message });
    await webhookRepository.markProcessed(eventId, 'FAILED', { error: message, attempts: attempt });
    throw error;
  }
};

const handleKybEvent = async (eventName: string, payload: any, context?: WebhookContext) => {
  const status = KYB_EVENT_TO_STATUS[eventName];
  const customerId: string = extractCustomerId(payload);

  const user = await userRepository.findByOneMoneyCustomerId(customerId);
  if (!user) {
    logger.warn('Webhook received for unknown customer', { customerId, eventName });
    return;
  }

  // @ts-ignore - TypeScript incorrectly infers customerId as string | undefined
  await userRepository.updateKybStatusByCustomerId(customerId, status);

  log({
    context: buildContext({
      ip: context?.ip,
      headers: context?.headers,
      dbUser: { id: user.id },
    }),
    action: ActivityAction.KYB_UPDATED,
    category: ActivityCategory.KYB,
    detail: `Webhook event ${eventName} updated KYB status to ${status}`,
    metadata: { eventName, payload },
  });
};

const extractCustomerId = (payload: any): string => {
  // 1Money usually includes a customer id in resource.id or data.customer.id
  if (payload?.resource?.id) return payload.resource.id as string;
  if (payload?.data?.customer?.id) return payload.data.customer.id as string;
  if (payload?.data?.customer_id) return payload.data.customer_id as string;
  throw new Error('Customer ID not found in webhook payload');
};
