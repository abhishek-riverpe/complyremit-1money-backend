import { Router } from 'express';
import multer from 'multer';
import * as storageController from '../controllers/storage.controller';
import validate from '../middlewares/validate';
import { uploadUrlSchema, downloadUrlSchema } from '../schemas/storage.schema';

const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_CONTENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only PDF, PNG, JPEG, and WebP files are accepted.'));
    }
  },
});

const router = Router();

router.post('/upload', upload.single('file'), storageController.uploadFile);
router.post('/upload-url', validate(uploadUrlSchema), storageController.getUploadUrl);
router.post('/download-url', validate(downloadUrlSchema), storageController.getDownloadUrl);

export default router;
