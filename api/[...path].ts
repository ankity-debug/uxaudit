// Vercel serverless function that forwards to the existing Express app
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Let Express handle the request under /api/*
  // The Express app already includes the '/api' prefix on routes
  // so requests to '/api/...' land on the correct handlers.
  return app(req as any, res as any);
}

