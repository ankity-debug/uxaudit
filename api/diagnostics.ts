import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

  res.status(200).json({
    ok: true,
    hasKey: hasOpenRouterKey,
    environment: process.env.VERCEL_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
    runtime: 'vercel-serverless',
    nodeVersion: process.version,
    // Don't expose the actual key value for security
    keyStatus: hasOpenRouterKey ? 'configured' : 'missing'
  });
}