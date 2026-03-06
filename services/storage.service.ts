import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME } from '../lib/r2-client';
import { randomUUID } from 'crypto';

export const generateUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
};

export const generateDownloadUrl = async (
  key: string,
  expiresIn = 3600,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
};

export const deleteObject = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  await r2Client.send(command);
};

export const deleteObjects = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;
  const command = new DeleteObjectsCommand({
    Bucket: R2_BUCKET_NAME,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
    },
  });
  await r2Client.send(command);
};

export const fetchAsBase64 = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  const response = await r2Client.send(command);
  const bytes = await response.Body!.transformToByteArray();
  return Buffer.from(bytes).toString('base64');
};

type DocumentCategory = 'business_document' | 'id_front' | 'id_back' | 'poa';

export const buildObjectKey = (
  userId: string,
  category: DocumentCategory,
  fileName: string,
): string => {
  const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
  const uuid = randomUUID();

  switch (category) {
    case 'business_document':
      return `${userId}/documents/${uuid}${ext}`;
    case 'id_front':
    case 'id_back':
    case 'poa':
      return `${userId}/persons/${uuid}${ext}`;
  }
};
