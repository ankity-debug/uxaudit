"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const geminiService_1 = require("../services/geminiService");
const screenshotService_1 = require("../services/screenshotService");
class AuditController {
    constructor() {
        this.auditWebsite = async (req, res) => {
            try {
                const { type, url, targetAudience, userGoals, businessObjectives } = req.body;
                const file = req.file;
                if (!type || (type !== 'url' && type !== 'image')) {
                    res.status(400).json({ error: 'Invalid audit type. Must be "url" or "image"' });
                    return;
                }
                let imageBase64;
                let auditUrl;
                if (type === 'url') {
                    if (!url) {
                        res.status(400).json({ error: 'URL is required for URL audit' });
                        return;
                    }
                    // Validate URL format
                    try {
                        new URL(url);
                    }
                    catch {
                        res.status(400).json({ error: 'Invalid URL format' });
                        return;
                    }
                    auditUrl = url;
                    // Skip screenshot capture for now and proceed with URL-only analysis
                    console.log(`Performing URL-only audit for: ${url}`);
                    imageBase64 = undefined;
                }
                else if (type === 'image') {
                    if (!file) {
                        res.status(400).json({ error: 'Image file is required for image audit' });
                        return;
                    }
                    // Validate file type
                    if (!file.mimetype.startsWith('image/')) {
                        res.status(400).json({ error: 'File must be an image' });
                        return;
                    }
                    // Process uploaded image
                    try {
                        const processedBuffer = await this.screenshotService.processUploadedImage(file.buffer);
                        imageBase64 = this.screenshotService.bufferToBase64(processedBuffer);
                    }
                    catch (processError) {
                        console.error('Image processing error:', processError);
                        res.status(500).json({ error: 'Failed to process uploaded image' });
                        return;
                    }
                }
                // Perform UX analysis with Gemini
                try {
                    const auditResult = await this.geminiService.analyzeUX({
                        imageBase64,
                        url: auditUrl,
                        analysisType: type === 'url' ? 'url' : 'screenshot',
                        targetAudience,
                        userGoals,
                        businessObjectives
                    });
                    // Add screenshot data to the response
                    if (imageBase64) {
                        auditResult.imageUrl = `data:image/jpeg;base64,${imageBase64}`;
                    }
                    res.json(auditResult);
                }
                catch (analysisError) {
                    console.error('Analysis error:', analysisError);
                    const reason = analysisError?.message || 'Failed to complete UX analysis';
                    res.status(500).json({
                        error: 'Audit failed',
                        message: reason
                    });
                }
            }
            catch (error) {
                console.error('Audit controller error:', error);
                res.status(500).json({
                    error: 'Internal server error occurred during audit'
                });
            }
        };
        this.getAuditStatus = async (req, res) => {
            res.json({
                status: 'ready',
                message: 'UX Audit service is running',
                timestamp: new Date().toISOString()
            });
        };
        // Use the OpenRouter API key from environment variables
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY environment variable is required');
        }
        this.geminiService = new geminiService_1.GeminiService(apiKey);
        this.screenshotService = new screenshotService_1.ScreenshotService();
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=auditController.js.map