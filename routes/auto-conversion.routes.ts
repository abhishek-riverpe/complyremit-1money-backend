import { Router } from 'express';
import { autoConversionController as controller } from '../controllers';
import validate from '../middlewares/validate';
import requireIdempotencyKey from '../middlewares/require-idempotency-key';
import { createAutoConversionRuleSchema, listAutoConversionRulesSchema } from '../schemas';
import { financialLimiter } from '../middlewares/rate-limit';

const router = Router();

router.post('/', financialLimiter, requireIdempotencyKey, validate(createAutoConversionRuleSchema), controller.createRule);
router.get('/', validate(listAutoConversionRulesSchema, 'query'), controller.listRules);
router.get('/by-idempotency-key/:idempotencyKey', controller.getRuleByIdempotencyKey);
router.get('/:ruleId', controller.getRule);
router.delete('/:ruleId', requireIdempotencyKey, controller.deleteRule);
router.get('/:ruleId/orders', controller.listOrders);
router.get('/:ruleId/orders/:orderId', controller.getOrder);

export default router;
