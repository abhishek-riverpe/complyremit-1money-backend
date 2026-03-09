import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import * as storageService from '../services/storage.service';
import { activityLogService } from '../services';
import { ActivityAction, ActivityCategory } from '../types/activity-log.types';

export const getUploadUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { fileName, contentType, category } = req.body;

  const objectKey = storageService.buildObjectKey(authReq.dbUser!.id, category, fileName);
  const uploadUrl = await storageService.generateUploadUrl(objectKey, contentType);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.FILE_UPLOAD_URL_GENERATED,
    category: ActivityCategory.STORAGE,
    detail: 'Upload URL generated',
    metadata: { objectKey, category },
  });

  APIResponse.success(res, 'Upload URL generated', { uploadUrl, objectKey });
};

export const uploadFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const file = req.file;
  if (!file) {
    APIResponse.error(res, 400, 'No file provided');
    return;
  }
  const { category } = req.body;
  const objectKey = storageService.buildObjectKey(authReq.dbUser!.id, category, file.originalname);
  await storageService.uploadObject(objectKey, file.buffer, file.mimetype);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.FILE_UPLOADED,
    category: ActivityCategory.STORAGE,
    detail: 'File uploaded',
    metadata: { objectKey, category },
  });

  APIResponse.success(res, 'File uploaded', { objectKey });
};

export const getDownloadUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { objectKey } = req.body;
  const downloadUrl = await storageService.generateDownloadUrl(objectKey);

  activityLogService.log({
    context: activityLogService.buildContext(authReq),
    action: ActivityAction.FILE_DOWNLOAD_URL_GENERATED,
    category: ActivityCategory.STORAGE,
    detail: 'Download URL generated',
    metadata: { objectKey },
  });

  APIResponse.success(res, 'Download URL generated', { downloadUrl });
};
