import { Router } from 'express';
import { userController, kybController } from '../controllers';
import validate from '../middlewares/validate';
import requireIdempotencyKey from '../middlewares/require-idempotency-key';
import dbUser from '../middlewares/db-user';
import requireCustomer from '../middlewares/require-customer';
import { createUserSchema, createCustomerSchema, updateCustomerSchema, createTosLinkSchema } from '../schemas';

const router = Router();

// User profile routes
router.post('/', validate(createUserSchema), userController.createUser);
router.get('/business', userController.getUser);

// KYB routes (need dbUser; GET/PUT also need customerId)
router.post('/business/kyb', dbUser, requireIdempotencyKey, validate(createCustomerSchema), kybController.createCustomer);
router.get('/business/kyb', dbUser, requireCustomer, kybController.getCustomer);
router.put('/business/kyb', dbUser, requireCustomer, requireIdempotencyKey, validate(updateCustomerSchema), kybController.updateCustomer);

// TOS routes (1Money TOS signing - part of KYB flow, need dbUser)
router.post('/business/kyb/tos/link', dbUser, requireIdempotencyKey, validate(createTosLinkSchema), kybController.createTosLink);
router.post('/business/kyb/tos/:sessionToken/sign', dbUser, requireIdempotencyKey, kybController.signTos);

export default router;
