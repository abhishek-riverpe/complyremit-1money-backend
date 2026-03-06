import { Router } from 'express';
import * as storageController from '../controllers/storage.controller';
import validate from '../middlewares/validate';
import { uploadUrlSchema } from '../schemas/storage.schema';

const router = Router();

router.post('/upload-url', validate(uploadUrlSchema), storageController.getUploadUrl);
router.post('/download-url', storageController.getDownloadUrl);

export default router;
