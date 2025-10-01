import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { AuditController } from './controllers/auditController';
import { upload } from './utils/multerConfig';
import path from 'path';
const app = express();

// Configure CORS origins from environment
const getAllowedOrigins = (): string[] => {
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(',').map(origin => origin.trim());
  }

  // Default origins for development
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }

  // Production must specify CORS_ORIGINS explicitly
  console.warn('⚠️ CORS_ORIGINS not set in production - defaulting to restrictive policy');
  return ['https://uxaudit.ly.design'];
};

const allowedOrigins = getAllowedOrigins();

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests without origin (mobile apps, postman, etc.)
    if (!origin) return cb(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // Reject with error
    console.warn(`🚫 CORS blocked origin: ${origin}`);
    return cb(new Error(`CORS policy violation: ${origin} not allowed`), false);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting for audit endpoints
const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Stricter in production
  message: {
    error: 'Too many audit requests',
    message: 'Please wait before requesting another audit',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for whitelisted IPs (optional)
  skip: (req) => {
    const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelistedIPs.includes(req.ip || '');
  }
});

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests',
    message: 'Please slow down',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// Initialize controllers
const auditController = new AuditController();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'UX Audit Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/status', auditController.getAuditStatus);

// Main audit endpoint - handles both URL and image uploads
app.post('/api/audit', auditLimiter, upload.single('image'), auditController.auditWebsite);

// Share audit report via email (also rate limited as it's resource intensive)
app.post('/api/share-report', auditLimiter, auditController.shareAuditReport);

// Absolute path to the frontend build
const frontendBuild = path.resolve(__dirname, "..", "..", "frontend", "build");

// Serve static assets
app.use(express.static(frontendBuild));

// SPA fallback: always return index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});


export default app;
