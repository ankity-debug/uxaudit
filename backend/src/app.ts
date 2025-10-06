import express from 'express';
import cors from 'cors';
import { AuditController } from './controllers/auditController';
import { upload } from './utils/multerConfig';
import path from 'path';
const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://auditgit.vercel.app', 'https://lemonyellow.design']
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware
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

// Share audit report via email
app.post('/api/share-report', auditController.shareAuditReport);

// Absolute path to the frontend build
const frontendBuild = path.resolve(__dirname, "..", "..", "frontend", "build");

// Serve static assets
app.use(express.static(frontendBuild));

// SPA fallback: always return index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});


export default app;
