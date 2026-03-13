import logger from '../lib/logger';
import webhookRepository from '../repositories/webhook.repository';
import userRepository from '../repositories/user.repository';
import autoConversionRepository from '../repositories/auto-conversion.repository';
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

const AUTO_CONVERSION_EVENTS = new Set([
  'auto_conversion_rule.create',
  'auto_conversion_rule_order.completed',
  'auto_conversion_rule_order.deposit_failed',
  'auto_conversion_rule_order.conversion_failed',
  'auto_conversion_rule_order.withdrawal_failed',
]);

const ORDER_EVENT_TO_STATUS: Record<string, string> = {
  'auto_conversion_rule_order.completed': 'completed',
  'auto_conversion_rule_order.deposit_failed': 'deposit_failed',
  'auto_conversion_rule_order.conversion_failed': 'conversion_failed',
  'auto_conversion_rule_order.withdrawal_failed': 'withdrawal_failed',
};

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

    // Auto-conversion rule and order events
    if (AUTO_CONVERSION_EVENTS.has(eventName)) {
      await handleAutoConversionEvent(eventName, payload, context);
    }

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

const handleAutoConversionEvent = async (eventName: string, payload: any, context?: WebhookContext) => {
  const customerId = extractCustomerId(payload);
  const user = await userRepository.findByOneMoneyCustomerId(customerId);

  if (!user) {
    logger.warn('Auto-conversion webhook for unknown customer', { customerId, eventName });
    return;
  }

  if (eventName === 'auto_conversion_rule.create') {
    const ruleData = payload?.data || payload?.resource;
    const oneMoneyRuleId = ruleData?.rule_id || ruleData?.id;

    if (!oneMoneyRuleId) {
      logger.warn('auto_conversion_rule.create missing rule_id', { payload });
      return;
    }

    // Upsert — the rule may already exist if our API call saved it first
    const existing = await autoConversionRepository.findByOneMoneyRuleId(oneMoneyRuleId);
    if (!existing) {
      await autoConversionRepository.createRule({
        userId: user.id,
        oneMoneyRuleId,
        oneMoneyCustomerId: customerId,
        status: ruleData?.status || 'active',
        sourceAsset: ruleData?.source_asset || '',
        sourceNetwork: ruleData?.source_network || '',
        destinationAsset: ruleData?.destination_asset || '',
        destinationNetwork: ruleData?.destination_network,
      });
    }

    log({
      context: buildContext({ ip: context?.ip, headers: context?.headers, dbUser: { id: user.id } }),
      action: ActivityAction.CONVERSION_RULE_STATUS_UPDATED,
      category: ActivityCategory.CONVERSION,
      detail: `Webhook: auto-conversion rule created`,
      metadata: { eventName, oneMoneyRuleId },
    });
    return;
  }

  // Order events
  const orderStatus = ORDER_EVENT_TO_STATUS[eventName];
  if (orderStatus) {
    const orderData = payload?.data || payload?.resource;
    const oneMoneyOrderId = orderData?.order_id || orderData?.id;
    const oneMoneyRuleId = orderData?.rule_id || orderData?.auto_conversion_rule_id;

    if (!oneMoneyOrderId) {
      logger.warn(`${eventName} missing order_id`, { payload });
      return;
    }

    // Find the local rule to link the order
    const rule = oneMoneyRuleId ? await autoConversionRepository.findByOneMoneyRuleId(oneMoneyRuleId) : null;
    if (!rule) {
      logger.warn('Auto-conversion order webhook for unknown rule', { oneMoneyRuleId, eventName });
      return;
    }

    const failureReason = orderStatus !== 'completed'
      ? (orderData?.failure_reason || orderData?.error || eventName)
      : undefined;

    await autoConversionRepository.upsertOrder({
      ruleId: rule.id,
      oneMoneyOrderId,
      status: orderStatus,
      failureReason,
      payload: orderData,
    });

    log({
      context: buildContext({ ip: context?.ip, headers: context?.headers, dbUser: { id: user.id } }),
      action: ActivityAction.CONVERSION_ORDER_STATUS_UPDATED,
      category: ActivityCategory.CONVERSION,
      detail: `Webhook: conversion order ${orderStatus}`,
      metadata: { eventName, oneMoneyOrderId, oneMoneyRuleId },
    });
  }
};

const extractCustomerId = (payload: any): string => {
  // 1Money usually includes a customer id in resource.id or data.customer.id
  if (payload?.resource?.id) return payload.resource.id as string;
  if (payload?.data?.customer?.id) return payload.data.customer.id as string;
  if (payload?.data?.customer_id) return payload.data.customer_id as string;
  throw new Error('Customer ID not found in webhook payload');
};
