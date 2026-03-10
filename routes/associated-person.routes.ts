import { Router } from 'express';
import { associatedPersonController } from '../controllers';
import validate from '../middlewares/validate';
import requireIdempotencyKey from '../middlewares/require-idempotency-key';
import { createAssociatedPersonSchema, updateAssociatedPersonSchema } from '../schemas';

const router = Router();

router.post(
  '/',
  requireIdempotencyKey,
  validate(createAssociatedPersonSchema),
  associatedPersonController.createAssociatedPerson,
);

router.get('/', associatedPersonController.listAssociatedPersons);

router.get('/:associatedPersonId', associatedPersonController.getAssociatedPerson);

router.put(
  '/:associatedPersonId',
  requireIdempotencyKey,
  validate(updateAssociatedPersonSchema),
  associatedPersonController.updateAssociatedPerson,
);

router.delete(
  '/:associatedPersonId',
  requireIdempotencyKey,
  associatedPersonController.deleteAssociatedPerson,
);

export default router;
