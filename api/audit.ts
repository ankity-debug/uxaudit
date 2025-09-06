import { VercelRequest, VercelResponse } from '@vercel/node';
import multiparty from 'multiparty';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enhanced CORS configuration
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://uxaudit.vercel.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests without origin (like curl)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
    }

    // Parse multipart form data
    const form = new multiparty.Form();
    
    const { fields } = await new Promise<{
      fields: { [key: string]: string[] };
      files: { [key: string]: any[] };
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const type = fields.type?.[0];
    const url = fields.url?.[0];

    if (!type || (type !== 'url' && type !== 'image')) {
      return res.status(400).json({ error: 'Invalid audit type. Must be "url" or "image"' });
    }

    if (type === 'url') {
      if (!url) {
        return res.status(400).json({ error: 'URL is required for URL audit' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
    }

    // For now, create a simple mock response
    // TODO: Implement full OpenRouter integration in serverless environment
    const mockAuditResult = {
      id: uuidv4(),
      url: type === 'url' ? url : undefined,
      timestamp: new Date().toISOString(),
      scores: {
        overall: {
          score: 3.2,
          maxScore: 5.0,
          percentage: 64,
          grade: 'C',
          confidence: 0.8
        },
        heuristics: { 
          score: 3.1, 
          maxScore: 5.0, 
          percentage: 62,
          issues: [],
          insights: 'Navigation consistency needs improvement'
        },
        uxLaws: { 
          score: 3.0, 
          maxScore: 5.0, 
          percentage: 60,
          issues: [],
          insights: 'Click targets and information density issues identified'
        },
        copywriting: { 
          score: 4.0, 
          maxScore: 5.0, 
          percentage: 80,
          issues: [],
          insights: 'Generally good content with minor CTA improvements needed'
        },
        accessibility: { 
          score: 2.5, 
          maxScore: 5.0, 
          percentage: 50,
          issues: [],
          insights: 'Color contrast compliance needs attention'
        },
        maturityScorecard: {
          overall: 64,
          heuristics: 62,
          uxLaws: 60,
          copywriting: 80,
          accessibility: 50,
          maturityLevel: 'developing' as const
        }
      },
      issues: [
        {
          id: uuidv4(),
          title: 'Navigation Consistency Issues',
          description: 'The navigation menu uses different styles across pages.',
          severity: 'major' as const,
          category: 'heuristics' as const,
          heuristic: 'Consistency and Standards',
          recommendation: 'Standardize navigation styling across all pages.',
          evidence: [{ type: 'screenshot' as const, reference: 'nav-inconsistency', description: 'Different menu styles' }],
          impact: 'high' as const,
          effort: 'medium' as const
        }
      ],
      summary: 'Demo audit completed successfully. This is a simplified version for Vercel deployment testing.',
      recommendations: [
        'Standardize navigation patterns across the platform',
        'Improve color contrast ratios to meet WCAG AA standards',
        'Increase click target sizes for better mobile usability'
      ],
      insights: [
        'Navigation inconsistency is the primary barrier to user confidence',
        'Accessibility issues affect user experience significantly',
        'Overall UX foundation is solid but needs consistency improvements'
      ],
      userJourneys: [],
      evidenceFiles: [],
      analysisMetadata: {
        model: 'demo-vercel-function',
        processingTime: Date.now(),
        pagesAnalyzed: url ? [url] : ['demo-analysis'],
        confidenceScore: 0.8
      }
    };

    res.status(200).json(mockAuditResult);

  } catch (error) {
    console.error('Audit handler error:', error);
    
    // Enhanced error reporting for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return res.status(500).json({ 
      error: 'Internal server error occurred during audit',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      // Include stack trace only in development
      ...(process.env.VERCEL_ENV !== 'production' && { stack: errorStack })
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // We handle multipart parsing manually
  },
};