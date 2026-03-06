import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import APIResponse from '../lib/APIResponse';
import * as storageService from '../services/storage.service';

export const getUploadUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const { fileName, contentType, category } = req.body;

  const objectKey = storageService.buildObjectKey(authReq.dbUser!.id, category, fileName);
  const uploadUrl = await storageService.generateUploadUrl(objectKey, contentType);

  APIResponse.success(res, 'Upload URL generated', { uploadUrl, objectKey });
};

export const getDownloadUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { objectKey } = req.body;
  const downloadUrl = await storageService.generateDownloadUrl(objectKey);
  APIResponse.success(res, 'Download URL generated', { downloadUrl });
};
