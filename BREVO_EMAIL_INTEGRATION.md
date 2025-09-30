# Brevo Email Integration

## Overview

Replaced the old Nodemailer email service with **Brevo (formerly Sendinblue)** transactional email API for sending UX audit reports.

---

## What Changed

### Removed
- ❌ `emailService.ts` (Nodemailer-based)
- ❌ All SMTP configuration (EMAIL_USER, EMAIL_PASSWORD, SMTP_HOST, etc.)

### Added
- ✅ `brevoEmailService.ts` (Brevo API-based)
- ✅ Single API key authentication
- ✅ Better deliverability and tracking
- ✅ Professional email template with pink branding

---

## Features

### 1. **Brevo Transactional Email API**
- Uses Brevo's REST API (`/v3/smtp/email`)
- No SMTP configuration needed
- Better deliverability rates
- Email tracking and analytics (via Brevo dashboard)

### 2. **Improved Email Template**
- Professional HTML design
- Pink gradient header (#EF4171 → #D93A63)
- Mobile-responsive layout
- Clear call-to-action button
- Report contents overview

### 3. **PDF Attachment Support**
- Converts PDF buffer to base64
- Attaches as `{platformName}-ux-audit-report.pdf`
- Up to 20MB attachment size (Brevo limit)

### 4. **Error Handling**
- Comprehensive error logging
- Brevo API error messages passed through
- Graceful failure with user-friendly messages

### 5. **Connection Verification**
- `verifyConnection()` method to test API key
- `getAccountInfo()` to check plan details
- Startup validation

---

## Configuration

### Environment Variables

Add to `.env`:
```bash
# Brevo Configuration (REQUIRED)
BREVO_API_KEY=your_brevo_api_key_here

# Email Sender Details (OPTIONAL - defaults provided)
EMAIL_FROM=experience@lemonyellow.design
EMAIL_FROM_NAME=UX Audit Platform
```

### Getting Brevo API Key

1. **Sign up for Brevo:**
   - Go to https://www.brevo.com/
   - Create a free account (300 emails/day free tier)

2. **Generate API Key:**
   ```
   Login → Settings → SMTP & API → API Keys → Create a new API key
   ```

3. **Copy API key:**
   ```
   Format: xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Add to `.env`:**
   ```bash
   BREVO_API_KEY=xkeysib-your-actual-key-here
   ```

---

## API Reference

### Brevo Endpoint Used
```
POST https://api.brevo.com/v3/smtp/email
```

**Headers:**
```
api-key: {YOUR_API_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "sender": {
    "name": "UX Audit Platform",
    "email": "experience@lemonyellow.design"
  },
  "to": [
    {
      "email": "recipient@example.com",
      "name": "John Doe"
    }
  ],
  "subject": "Your UX Audit Report for Example.com",
  "htmlContent": "<html>...</html>",
  "attachment": [
    {
      "name": "example-ux-audit-report.pdf",
      "content": "base64_encoded_pdf"
    }
  ]
}
```

**Response (Success):**
```json
{
  "messageId": "<xxxxxxxxxxxxx@smtp-relay.mailin.fr>"
}
```

---

## Usage

### From Share Report Modal

**Frontend Request:**
```typescript
const response = await fetch('/api/share-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    auditData: auditResult,
    recipientEmail: 'user@example.com',
    recipientName: 'John Doe',
    platformName: 'Example.com'
  })
});
```

**Backend Flow:**
```
1. Validate input (email format, name length, etc.)
2. Generate PDF from audit data
3. Send email via Brevo with PDF attachment
4. Return success/error response
```

**Success Response:**
```json
{
  "success": true,
  "message": "Audit report sent successfully to user@example.com",
  "to": "user@example.com",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Failed to generate or send report",
  "message": "Brevo API Error: Invalid API key"
}
```

---

## Email Template Preview

### Header
```
┌─────────────────────────────────────┐
│   🎉 UX Audit Report Ready!         │  <- Pink gradient
│   Your comprehensive analysis       │
└─────────────────────────────────────┘
```

### Body
```
Hi John Doe,

Thank you for using our UX Audit Platform!
We've completed a comprehensive analysis of
Example.com and have attached your detailed report.

┌─────────────────────────────────────┐
│ 📋 What's in your report:           │
│  • Overall UX Score & Breakdown     │
│  • Heuristic Violations Analysis    │
│  • Visual Design Audit              │
│  • Accessibility Insights           │
│  • Prioritized Fixes                │
│  • User Journey Analysis            │
└─────────────────────────────────────┘

We hope this analysis helps you enhance
your user experience.

[Visit Our Website]  <- CTA Button
```

### Footer
```
This email was sent from UX Audit Platform
Your privacy is important to us.
```

---

## Code Structure

### BrevoEmailService Class

```typescript
class BrevoEmailService {
  private client: AxiosInstance;
  private senderEmail: string;
  private senderName: string;

  constructor()
    // Initialize Brevo API client with API key

  async sendAuditReport(
    recipientEmail: string,
    recipientName: string,
    platformName: string,
    pdfBuffer: Buffer
  ): Promise<void>
    // Convert PDF to base64
    // Build HTML template
    // Send via Brevo API
    // Handle errors

  private buildEmailTemplate(
    recipientName: string,
    platformName: string
  ): string
    // Generate responsive HTML email

  async verifyConnection(): Promise<boolean>
    // Test API key validity

  async getAccountInfo(): Promise<any>
    // Get Brevo account details
}
```

---

## Testing

### 1. Test API Connection
```bash
cd uxaudit/backend

# Add to test file
node -e "
const { BrevoEmailService } = require('./dist/services/brevoEmailService.js');
(async () => {
  const service = new BrevoEmailService();
  const isValid = await service.verifyConnection();
  console.log('Brevo API Valid:', isValid);

  const info = await service.getAccountInfo();
  console.log('Account:', info?.email);
  console.log('Plan:', info?.plan?.[0]?.type);
})();
"
```

**Expected Output:**
```
🔍 Verifying Brevo API connection...
✅ Brevo API connection verified
   Account: your-email@example.com
   Plan: free
Brevo API Valid: true
Account: your-email@example.com
Plan: free
```

### 2. Test Share Report Endpoint
```bash
curl -X POST http://localhost:3001/api/share-report \
  -H "Content-Type: application/json" \
  -d '{
    "auditData": {
      "url": "https://example.com",
      "scores": {"overall": {"score": 3.5}},
      "issues": []
    },
    "recipientEmail": "test@example.com",
    "recipientName": "Test User",
    "platformName": "Example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Audit report sent successfully to test@example.com",
  "to": "test@example.com",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 3. Check Brevo Dashboard
- Login to Brevo dashboard
- Go to **Statistics → Email** to see sent emails
- Check delivery status, opens, clicks

---

## Error Handling

### Common Errors

#### 1. Missing API Key
```
Error: BREVO_API_KEY environment variable is required
```
**Solution:** Add `BREVO_API_KEY` to `.env`

#### 2. Invalid API Key
```
Brevo API Error: {"code":"unauthorized","message":"Key not found"}
```
**Solution:** Verify API key is correct

#### 3. Invalid Email Address
```
Brevo API Error: {"code":"invalid_parameter","message":"email is not a valid email"}
```
**Solution:** Frontend validates email format

#### 4. Attachment Too Large
```
Brevo API Error: {"code":"invalid_parameter","message":"attachment size exceeds 20MB"}
```
**Solution:** Compress PDF or reduce content

#### 5. Rate Limit Exceeded (Free Tier)
```
Brevo API Error: {"code":"too_many_requests","message":"Daily limit reached"}
```
**Solution:** Upgrade Brevo plan or wait 24 hours

---

## Brevo Free Tier Limits

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Emails/day** | 300 | Unlimited |
| **Emails/month** | 9,000 | Unlimited |
| **Attachment size** | 20MB | 20MB |
| **API calls** | Unlimited | Unlimited |
| **Tracking** | ✅ Yes | ✅ Yes |
| **Analytics** | ✅ Yes | ✅ Yes |

**Recommendation:** Free tier is sufficient for testing and small-scale usage.

---

## Migration Notes

### What Was Removed
```bash
# Old env variables (NO LONGER NEEDED):
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_SERVICE=gmail
```

### What To Add
```bash
# New env variable (REQUIRED):
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxx

# Optional (defaults provided):
EMAIL_FROM=experience@lemonyellow.design
EMAIL_FROM_NAME=UX Audit Platform
```

### Dependencies
No changes needed - `axios` already in `package.json`

---

## Advantages over Nodemailer/SMTP

| Feature | Nodemailer (Old) | Brevo (New) |
|---------|------------------|-------------|
| **Configuration** | Complex (SMTP host, port, auth) | Simple (one API key) |
| **Deliverability** | Depends on SMTP server | High (dedicated IPs) |
| **Tracking** | ❌ No | ✅ Yes (opens, clicks) |
| **Rate Limiting** | Gmail: 500/day | Free: 300/day |
| **Email Validation** | Manual | Built-in |
| **Spam Score** | Higher | Lower (reputation) |
| **Analytics** | ❌ No | ✅ Yes (dashboard) |
| **Retries** | Manual | Automatic |

---

## Monitoring

### Check Email Status in Brevo
1. Login to Brevo dashboard
2. Go to **Statistics → Email → Transactional**
3. View:
   - Sent emails
   - Delivery rate
   - Opens
   - Clicks
   - Bounces

### Log Analysis
```bash
# Check successful sends
grep "✅ Audit report email sent" logs/*.log

# Check failures
grep "❌ Error sending email" logs/*.log

# Check Brevo API errors
grep "Brevo API Error" logs/*.log
```

---

## Troubleshooting

### Email Not Received

1. **Check Brevo Dashboard:**
   - Was email sent? (Check Statistics)
   - Delivery status?

2. **Check Spam Folder:**
   - Brevo emails rarely go to spam
   - If they do, ask recipient to whitelist sender

3. **Check Logs:**
   ```bash
   tail -f logs/app.log | grep "Brevo"
   ```

4. **Verify Sender Domain:**
   - Add SPF/DKIM records (optional but recommended)
   - Go to Brevo → Senders → Authenticate

### API Rate Limiting

**Free tier:** 300 emails/day
**Solution:** Upgrade to paid plan or implement queue

---

## Security Best Practices

✅ **DO:**
- Store API key in `.env` (never commit)
- Use environment-specific keys (dev/prod)
- Validate recipient email format
- Sanitize user inputs (name, platform name)
- Limit email rate (prevent abuse)

❌ **DON'T:**
- Commit API key to git
- Share API key publicly
- Allow arbitrary email sending
- Send to unvalidated addresses

---

## Production Deployment

### Vercel/Cloud Deployment

1. **Set Environment Variable:**
   ```bash
   vercel env add BREVO_API_KEY
   # Paste your API key when prompted
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Verify:**
   ```bash
   curl https://your-app.vercel.app/api/status
   ```

### Docker Deployment

```dockerfile
# In docker-compose.yml or Dockerfile
ENV BREVO_API_KEY=your-key-here
```

---

## Rollback Plan

If Brevo integration fails:

```bash
# Restore old email service
git checkout uxaudit/backend/src/services/emailService.ts
git checkout uxaudit/backend/src/controllers/auditController.ts

# Reinstall nodemailer
npm install nodemailer @types/nodemailer

# Rebuild
npm run build && npm restart
```

---

## Summary

✅ **Replaced Nodemailer with Brevo API**
✅ **Simpler configuration (one API key)**
✅ **Better deliverability and tracking**
✅ **Professional email template with pink branding**
✅ **PDF attachment support**
✅ **Comprehensive error handling**
✅ **Free tier: 300 emails/day**

**Ready to use!** Just add your Brevo API key to `.env`