import { prisma } from '../lib/prisma';
import type { WebhookEventStatus } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

interface CreateWebhookEventData {
  eventId: string;
  deliveryId?: string;
  eventName: string;
  payload: Prisma.InputJsonValue;
  status?: WebhookEventStatus;
  error?: string;
  attempts?: number;
}

const webhookRepository = {
  create: async (data: CreateWebhookEventData) => {
    return prisma.webhookEvent.create({ data });
  },

  findByEventId: async (eventId: string) => {
    return prisma.webhookEvent.findUnique({ where: { eventId } });
  },

  markProcessed: async (eventId: string, status: WebhookEventStatus, options?: { error?: string; attempts?: number }) => {
    return prisma.webhookEvent.update({
      where: { eventId },
      data: {
        status,
        processedAt: new Date(),
        ...(options?.error ? { error: options.error } : {}),
        ...(typeof options?.attempts === 'number' ? { attempts: options.attempts } : {}),
      },
    });
  },
};

export default webhookRepository;
