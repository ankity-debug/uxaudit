import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ 
    status: 'healthy', 
    service: 'UX Audit Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}