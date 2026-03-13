import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { initEncryptionKey, encrypt, decrypt } from './encryption';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (process.env.NODE_ENV === 'production' && !connectionString.includes('sslmode=')) {
  throw new Error('DATABASE_URL must include sslmode parameter in production');
}

initEncryptionKey();

const adapter = new PrismaPg({
  connectionString,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
})

const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ['taxId'],
  AssociatedPerson: ['taxId', 'birthDate', 'docNationalIdentityNumber'],
};

// Nested relation keys that map to models with encrypted fields
const NESTED_MODEL_MAP: Record<string, Record<string, string>> = {
  User: { associatedPersons: 'AssociatedPerson' },
};

function encryptFields(model: string, data: Record<string, any>): Record<string, any> {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields || !data) return data;
  const result = { ...data };
  for (const field of fields) {
    if (field in result && result[field] != null) {
      result[field] = encrypt(result[field]);
    }
  }
  // Handle nested creates
  const nestedMap = NESTED_MODEL_MAP[model];
  if (nestedMap) {
    for (const [relationKey, nestedModel] of Object.entries(nestedMap)) {
      if (result[relationKey]?.create) {
        const nested = result[relationKey].create;
        if (Array.isArray(nested)) {
          result[relationKey] = {
            ...result[relationKey],
            create: nested.map((item: Record<string, any>) => encryptFields(nestedModel, item)),
          };
        } else {
          result[relationKey] = {
            ...result[relationKey],
            create: encryptFields(nestedModel, nested),
          };
        }
      }
    }
  }
  return result;
}

function decryptFields(model: string, record: any): any {
  if (!record || typeof record !== 'object') return record;
  if (Array.isArray(record)) return record.map((r) => decryptFields(model, r));

  const fields = ENCRYPTED_FIELDS[model];
  if (fields) {
    for (const field of fields) {
      if (field in record && record[field] != null) {
        record[field] = decrypt(record[field]);
      }
    }
  }

  // Decrypt nested relations
  const nestedMap = NESTED_MODEL_MAP[model];
  if (nestedMap) {
    for (const [relationKey, nestedModel] of Object.entries(nestedMap)) {
      if (record[relationKey]) {
        record[relationKey] = decryptFields(nestedModel, record[relationKey]);
      }
    }
  }

  return record;
}

const WRITE_OPS = new Set(['create', 'update', 'upsert', 'createMany', 'createManyAndReturn']);

const basePrisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
})

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const fields = model ? ENCRYPTED_FIELDS[model] : undefined;
        if (!fields) return query(args);

        const a = args as any;

        if (WRITE_OPS.has(operation)) {
          if (a.data) {
            a.data = encryptFields(model!, a.data);
          }
          // Handle upsert's separate create/update
          if (operation === 'upsert') {
            if (a.create) {
              a.create = encryptFields(model!, a.create);
            }
            if (a.update) {
              a.update = encryptFields(model!, a.update);
            }
          }
          // Handle createMany data array
          if (operation === 'createMany' && Array.isArray(a.data)) {
            a.data = a.data.map((item: Record<string, any>) => encryptFields(model!, item));
          }
        }

        const result = await query(args);

        // Decrypt on read
        if (result) {
          if (Array.isArray(result)) {
            return result.map((r) => decryptFields(model!, r));
          }
          return decryptFields(model!, result);
        }

        return result;
      },
    },
  },
});

export { prisma }
