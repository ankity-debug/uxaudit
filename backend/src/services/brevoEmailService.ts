import axios, { AxiosInstance } from 'axios';

interface BrevoEmailRequest {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name: string;
  }>;
  subject: string;
  htmlContent: string;
  attachment?: Array<{
    name: string;
    content: string; // Base64 encoded
  }>;
}

export class BrevoEmailService {
  private client: AxiosInstance;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is required');
    }

    this.senderEmail = process.env.EMAIL_FROM || 'experience@lemonyellow.design';
    this.senderName = process.env.EMAIL_FROM_NAME || 'LYcheeLens';

    // Initialize Brevo API client
    this.client = axios.create({
      baseURL: 'https://api.brevo.com/v3',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 300000 // 5 minutes
    });
  }

  /**
   * Send audit report via Brevo transactional email API
   */
  async sendAuditReport(
    recipientEmail: string,
    recipientName: string,
    platformName: string,
    pdfBuffer: Buffer
  ): Promise<void> {
    try {
      // Convert PDF buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');

      // Build email HTML content
      const htmlContent = this.buildEmailTemplate(recipientName, platformName);

      // Prepare Brevo API request
      const emailRequest: BrevoEmailRequest = {
        sender: {
          name: this.senderName,
          email: this.senderEmail
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName
          }
        ],
        subject: `Your UX Audit Report for ${platformName}`,
        htmlContent,
        attachment: [
          {
            name: `${platformName}-ux-audit-report.pdf`,
            content: pdfBase64
          }
        ]
      };

      // Send via Brevo API
      console.log(`📧 Sending audit report to ${recipientEmail} via Brevo...`);

      const response = await this.client.post('/smtp/email', emailRequest);

      if (response.status === 201) {
        console.log(`✅ Audit report email sent successfully to ${recipientEmail}`);
        console.log(`   Message ID: ${response.data.messageId}`);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      console.error('❌ Error sending email via Brevo:', error.response?.data || error.message);

      if (error.response?.data) {
        throw new Error(`Brevo API Error: ${JSON.stringify(error.response.data)}`);
      }

      throw new Error('Failed to send audit report email via Brevo');
    }
  }

  /**
   * Build HTML email template
   */
  private buildEmailTemplate(recipientName: string, platformName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your UX Audit Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #EF4171 0%, #D93A63 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
        🎉 UX Audit Report Ready!
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">
        Your comprehensive analysis for ${platformName}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 20px 0;">
        Hi <strong>${recipientName}</strong>,
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 20px 0;">
        Thank you for using LYcheeLens! We've completed a comprehensive analysis of <strong>${platformName}</strong> and have attached your detailed report.
      </p>

      <!-- Report Contents Box -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #EF4171;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">
          📋 What's in your report:
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Overall UX Score & Category Breakdown</li>
          <li style="margin-bottom: 8px;">Heuristic Violations Analysis</li>
          <li style="margin-bottom: 8px;">Visual Design Audit</li>
          <li style="margin-bottom: 8px;">Accessibility Insights</li>
          <li style="margin-bottom: 8px;">Prioritized Fixes with Business Impact</li>
          <li style="margin-bottom: 8px;">User Journey Analysis</li>
        </ul>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
        We hope this analysis helps you enhance your user experience and achieve your business objectives.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://lemonyellow.design" style="display: inline-block; background: #EF4171; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Visit Our Website
        </a>
      </div>

      <!-- Support Section -->
      <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 30px;">
        <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.6;">
          <strong style="color: #333;">Need help implementing these recommendations?</strong><br>
          Feel free to reach out to our team for consultation and implementation support.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
        This email was sent from <strong>LYcheeLens</strong>
      </p>
      <p style="margin: 0; font-size: 12px; color: #999;">
        Your privacy is important to us. We never share your data.
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Verify Brevo API connection and account status
   */
  async verifyConnection(): Promise<boolean> {
    try {
      console.log('🔍 Verifying Brevo API connection...');

      const response = await this.client.get('/account');

      if (response.status === 200) {
        console.log('✅ Brevo API connection verified');
        console.log(`   Account: ${response.data.email}`);
        console.log(`   Plan: ${response.data.plan?.[0]?.type || 'Unknown'}`);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Brevo API connection failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get account information (for debugging)
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.client.get('/account');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get account info:', error.response?.data || error.message);
      return null;
    }
  }
}