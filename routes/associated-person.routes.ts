import { Router } from 'express';
import { associatedPersonController } from '../controllers';
import validate from '../middlewares/validate';
import requireIdempotencyKey from '../middlewares/require-idempotency-key';
import { createAssociatedPersonSchema, updateAssociatedPersonSchema, associatedPersonIdParamSchema } from '../schemas';

const router = Router();

router.post(
  '/',
  requireIdempotencyKey,
  validate(createAssociatedPersonSchema),
  associatedPersonController.createAssociatedPerson,
);

router.get('/', associatedPersonController.listAssociatedPersons);

router.get('/:associatedPersonId', validate(associatedPersonIdParamSchema, 'params'), associatedPersonController.getAssociatedPerson);

router.put(
  '/:associatedPersonId',
  validate(associatedPersonIdParamSchema, 'params'),
  requireIdempotencyKey,
  validate(updateAssociatedPersonSchema),
  associatedPersonController.updateAssociatedPerson,
);

router.delete(
  '/:associatedPersonId',
  validate(associatedPersonIdParamSchema, 'params'),
  requireIdempotencyKey,
  associatedPersonController.deleteAssociatedPerson,
);

export default router;
