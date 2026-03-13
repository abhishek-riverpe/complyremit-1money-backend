import { Router } from 'express';
import multer from 'multer';
import * as storageController from '../controllers/storage.controller';
import validate from '../middlewares/validate';
import { uploadUrlSchema, downloadUrlSchema } from '../schemas/storage.schema';
import { uploadLimiter } from '../middlewares/rate-limit';

const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_CONTENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only PDF, JPEG, PNG, CSV, XLS, and XLSX files are accepted.'));
    }
  },
});

const router = Router();

router.post('/upload', uploadLimiter, upload.single('file'), storageController.uploadFile);
router.post('/upload-url', uploadLimiter, validate(uploadUrlSchema), storageController.getUploadUrl);
router.post('/download-url', validate(downloadUrlSchema), storageController.getDownloadUrl);

export default router;
