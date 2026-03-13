import { Router } from 'express';
import { simulateTransactionsController as controller } from '../controllers';
import validate from '../middlewares/validate';
import requireIdempotencyKey from '../middlewares/require-idempotency-key';
import { simulateTransactionSchema } from '../schemas';
import { financialLimiter } from '../middlewares/rate-limit';

const router = Router();

router.post('/', financialLimiter, requireIdempotencyKey, validate(simulateTransactionSchema), controller.simulateTransaction);

export default router;
