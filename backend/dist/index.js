"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auditController_1 = require("./controllers/auditController");
const multerConfig_1 = require("./utils/multerConfig");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        const devAllowed = ['http://localhost:3000', 'http://127.0.0.1:3000'];
        if (process.env.NODE_ENV !== 'production' && devAllowed.includes(origin))
            return cb(null, true);
        // Add production origins here if needed
        return cb(null, true);
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Initialize controllers
const auditController = new auditController_1.AuditController();
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
app.post('/api/audit', multerConfig_1.upload.single('image'), auditController.auditWebsite);
// Error handling middleware
app.use((error, req, res, next) => {
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
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 UX Audit Platform API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Connected' : 'Not configured'}`);
    console.log(`🌐 CORS origin: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'http://localhost:3000'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map