// Vercel serverless function at repo root that forwards to the shared Express app
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../uxaudit/backend/src/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}

