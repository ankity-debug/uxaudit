import { Request, Response } from 'express';
import { OpenRouterService } from '../services/openRouterService';
import { ScreenshotService } from '../services/screenshotService';
import { ContextualAuditService } from '../services/contextualAuditService';
import { BrevoEmailService } from '../services/brevoEmailService';
import { PDFService } from '../services/pdfService';
import { FaviconService } from '../services/faviconService';
import { AuditData } from '../types';

export class AuditController {
  private openRouterService: OpenRouterService;
  private screenshotService: ScreenshotService;
  private contextualAuditService: ContextualAuditService;
  private emailService: BrevoEmailService;
  private pdfService: PDFService;
  private faviconService: FaviconService;

  constructor() {
    // Use the OpenRouter API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    this.openRouterService = new OpenRouterService(apiKey);
    this.screenshotService = new ScreenshotService();
    this.contextualAuditService = new ContextualAuditService(apiKey);
    this.emailService = new BrevoEmailService();
    this.pdfService = new PDFService();
    this.faviconService = new FaviconService();

    // Cleanup browser on process exit for performance optimization
    const cleanup = async () => {
      console.log('🧹 Cleaning up browser instances and caches...');
      await this.screenshotService.cleanup();
      this.faviconService.clearCache();
      process.exit(0);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  auditWebsite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, url, targetAudience, userGoals, businessObjectives } = req.body;
      const file = req.file;

      if (!type || (type !== 'url' && type !== 'image')) {
        res.status(400).json({ error: 'Invalid audit type. Must be "url" or "image"' });
        return;
      }

      let imageBase64: string | undefined;
      let auditUrl: string | undefined;

      if (type === 'url') {
        if (!url) {
          res.status(400).json({ error: 'URL is required for URL audit' });
          return;
        }

        // Validate URL format
        try {
          new URL(url);
        } catch {
          res.status(400).json({ error: 'Invalid URL format' });
          return;
        }

        auditUrl = url;

        // Capture screenshot for URL audit
        try {
          console.log(`Capturing screenshot for URL: ${url}`);
          const screenshotBuffer = await this.screenshotService.captureWebsite(url);
          imageBase64 = this.screenshotService.bufferToBase64(screenshotBuffer);
          console.log('Screenshot captured successfully');
        } catch (screenshotError) {
          console.error('Screenshot capture failed:', screenshotError);
          // Continue with URL-only analysis if screenshot fails
          imageBase64 = undefined;
        }
      } else if (type === 'image') {
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
        } catch (processError) {
          console.error('Image processing error:', processError);
          res.status(500).json({ error: 'Failed to process uploaded image' });
          return;
        }
      }

      // Perform enhanced contextual UX analysis
      try {
        let auditResult: AuditData;

        if (type === 'url' && auditUrl) {
          // Fetch favicon in parallel with audit (don't block)
          const faviconPromise = this.faviconService.getFavicon(auditUrl);

          // Use contextual analysis for URL audits (sitemap + HTML + visual)
          console.log('Performing contextual analysis...');
          const [result, favicon] = await Promise.all([
            this.contextualAuditService.performContextualAudit({
              imageBase64,
              url: auditUrl,
              analysisType: 'contextual',
              targetAudience,
              userGoals,
              businessObjectives
            }),
            faviconPromise
          ]);

          auditResult = result;

          // Add favicon to result
          (auditResult as any).favicon = favicon;

        } else {
          // Use standard analysis for image uploads
          console.log('Performing standard analysis...');
          auditResult = await this.openRouterService.analyzeUX({
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

          // Fetch favicon for image audits if URL provided
          if (auditUrl) {
            const favicon = await this.faviconService.getFavicon(auditUrl);
            (auditResult as any).favicon = favicon;
          }
        }

        res.json(auditResult);
      } catch (analysisError: any) {
        console.error('Analysis error:', analysisError);
        const reason = analysisError?.message || 'Failed to complete UX analysis';
        res.status(500).json({
          error: 'Audit failed',
          message: reason
        });
      }

    } catch (error) {
      console.error('Audit controller error:', error);
      res.status(500).json({ 
        error: 'Internal server error occurred during audit' 
      });
    }
  };

  getAuditStatus = async (req: Request, res: Response): Promise<void> => {
    res.json({
      status: 'ready',
      message: 'UX Audit service is running',
      timestamp: new Date().toISOString()
    });
  };

  shareAuditReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { auditData, recipientEmail, recipientName, platformName } = req.body;

      // Validate required fields
      if (!auditData || !recipientEmail || !recipientName || !platformName) {
        res.status(400).json({
          error: 'Missing required fields. Need: auditData, recipientEmail, recipientName, platformName'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        res.status(400).json({ error: 'Invalid email address format' });
        return;
      }

      // Validate string lengths to prevent abuse
      if (recipientName.length > 100) {
        res.status(400).json({ error: 'Recipient name too long (max 100 characters)' });
        return;
      }

      if (platformName.length > 200) {
        res.status(400).json({ error: 'Platform name too long (max 200 characters)' });
        return;
      }

      // Sanitize strings
      const sanitizedName = recipientName.trim().replace(/[<>"'&]/g, '');
      const sanitizedPlatform = platformName.trim().replace(/[<>"'&]/g, '');

      if (!sanitizedName || !sanitizedPlatform) {
        res.status(400).json({ error: 'Invalid characters in name or platform fields' });
        return;
      }

      try {
        console.log(`📄 Generating PDF report for ${sanitizedPlatform}...`);
        const pdfBuffer = await this.pdfService.generateAuditReport(auditData, sanitizedPlatform);

        console.log(`📧 Sending report to ${recipientEmail} via Brevo...`);
        await this.emailService.sendAuditReport(
          recipientEmail,
          sanitizedName,
          sanitizedPlatform,
          pdfBuffer
        );

        res.json({
          success: true,
          message: `Audit report sent successfully to ${recipientEmail}`,
          to: recipientEmail,
          timestamp: new Date().toISOString()
        });
      } catch (sendErr: any) {
        console.error('❌ PDF/Email send error:', sendErr);
        res.status(500).json({
          error: 'Failed to generate or send report',
          message: sendErr?.message || 'Unknown error'
        });
      }

    } catch (error: any) {
      console.error('Share audit report error:', error);
      res.status(500).json({
        error: 'Failed to share audit report',
        message: error.message || 'Internal server error'
      });
    }
  };
}
