import { Router } from 'express';
import userRoutes from './user.routes';
import depositInstructionsRoutes from './deposit-instructions.routes';
import simulateTransactionsRoutes from './simulate-transactions.routes';
import autoConversionRoutes from './auto-conversion.routes';
import storageRoutes from './storage.routes';
import activityLogRoutes from './activity-log.routes';
import webhookRoutes from './webhook.routes';
import dbUser from '../middlewares/db-user';
import requireCustomer from '../middlewares/require-customer';

const router = Router();

// Public webhook endpoint (signed request)
router.use('/webhooks', webhookRoutes);

router.use('/users', userRoutes);
router.use('/storage', dbUser, storageRoutes);
router.use('/activity', dbUser, activityLogRoutes);
router.use('/deposit-instructions', dbUser, requireCustomer, depositInstructionsRoutes);
router.use('/simulate-transactions', dbUser, requireCustomer, simulateTransactionsRoutes);
router.use('/auto-conversion-rules', dbUser, requireCustomer, autoConversionRoutes);

export default router;
