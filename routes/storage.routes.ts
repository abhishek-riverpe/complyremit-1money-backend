import { Router } from 'express';
import multer from 'multer';
import * as storageController from '../controllers/storage.controller';
import validate from '../middlewares/validate';
import { uploadUrlSchema } from '../schemas/storage.schema';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post('/upload', upload.single('file'), storageController.uploadFile);
router.post('/upload-url', validate(uploadUrlSchema), storageController.getUploadUrl);
router.post('/download-url', storageController.getDownloadUrl);

export default router;
