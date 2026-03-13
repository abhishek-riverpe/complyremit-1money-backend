import { Router } from 'express';
import { autoConversionController as controller } from '../controllers';
import validate from '../middlewares/validate';
import requireIdempotencyKey from '../middlewares/require-idempotency-key';
import { createAutoConversionRuleSchema, listAutoConversionRulesSchema, ruleIdParamSchema, ruleOrderParamSchema, idempotencyKeyParamSchema } from '../schemas';
import { financialLimiter } from '../middlewares/rate-limit';

const router = Router();

router.post('/', financialLimiter, requireIdempotencyKey, validate(createAutoConversionRuleSchema), controller.createRule);
router.get('/', validate(listAutoConversionRulesSchema, 'query'), controller.listRules);
router.get('/by-idempotency-key/:idempotencyKey', validate(idempotencyKeyParamSchema, 'params'), controller.getRuleByIdempotencyKey);
router.get('/:ruleId', validate(ruleIdParamSchema, 'params'), controller.getRule);
router.delete('/:ruleId', validate(ruleIdParamSchema, 'params'), requireIdempotencyKey, controller.deleteRule);
router.get('/:ruleId/orders', validate(ruleIdParamSchema, 'params'), controller.listOrders);
router.get('/:ruleId/orders/:orderId', validate(ruleOrderParamSchema, 'params'), controller.getOrder);

export default router;
