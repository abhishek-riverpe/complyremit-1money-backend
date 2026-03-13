import { Router } from 'express';
import validate from '../middlewares/validate';
import verifyWebhookSignature from '../middlewares/webhook-signature';
import { webhookSchema } from '../schemas/webhook.schema';
import { receiveWebhook } from '../controllers/webhook.controller';

const router = Router();

// Webhook endpoint is public (no auth), but protected by signature
router.post('/', verifyWebhookSignature, validate(webhookSchema), receiveWebhook);

export default router;
