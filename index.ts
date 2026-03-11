import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import logger from './lib/logger';
import auth from './middlewares/auth';

import { globalLimiter } from './middlewares/rate-limit';
import errorHandler from './middlewares/error';
import router from './routes';
import helmet from 'helmet';
import { prisma as prismaClient } from './lib/prisma';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'idempotency-key'],
}));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    xssFilter: true,
    frameguard: { action: "deny" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    dnsPrefetchControl: { allow: false },
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
  })
);

app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Global request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  next();
});

// Health check (no auth required)
app.get("/health", async (req, res) => {
  try {
    await prismaClient.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check failed - database unreachable", { error });
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// 10mb body limit for base64-encoded documents in KYB applications
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(globalLimiter);

// Prevent caching of sensitive API responses
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
});

app.use('/api', auth, router);
app.use(errorHandler);

const requiredEnvVars = [
  'ONEMONEY_API_BASE_URL',
  'ONEMONEY_BEARER_TOKEN',
  'CLERK_SECRET_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'FRONTEND_URL',
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const port = process.env.PORT || 5000;

const server = app.listen(port, () => logger.info(`Server running on port ${port}`));

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await prismaClient.$disconnect();
    logger.info('Database disconnected');

    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
