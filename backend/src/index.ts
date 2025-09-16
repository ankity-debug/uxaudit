import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuditController } from './controllers/auditController';
import { upload } from './utils/multerConfig';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const devAllowed = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://uxaudit.ly.design'];
    if (process.env.NODE_ENV !== 'production' && devAllowed.includes(origin)) return cb(null, true);
    // Add production origins here if needed
    return cb(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.post('/api/audit', upload.single('image'), auditController.auditWebsite);


// Absolute path to the frontend build
const frontendBuild = path.resolve(__dirname, "..", "..", "frontend", "build");

// Serve static assets
app.use(express.static(frontendBuild));

// SPA fallback: always return index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 UX Audit Platform API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 CORS origin: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'http://localhost:3000'}`);
});

export default app;
