import { AuditData } from '../types';
import puppeteer from 'puppeteer';

export class PDFService {
  async generateAuditReport(auditData: AuditData, platformName: string): Promise<Buffer> {
    console.log('📄 PDFService: Generating comprehensive audit report PDF for:', platformName);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const page = await browser.newPage();

      // Generate HTML content that matches the web version exactly
      const htmlContent = this.generateHTMLContent(auditData, platformName);

      // Set content and wait for images to load
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 300000 // 5 minutes
      });

      // Generate PDF with optimized settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15px',
          right: '15px',
          bottom: '15px',
          left: '15px'
        }
      });

      console.log('✅ PDF generated successfully');
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private generateHTMLContent(auditData: AuditData, platformName: string): string {
    const getPlatformName = () => {
      if (auditData.url) {
        try {
          const hostname = new URL(auditData.url).hostname;
          return hostname.replace('www.', '');
        } catch {
          return auditData.url;
        }
      }
      return platformName || 'Uploaded Image Analysis';
    };

    const getKeyInsights = () => {
      const insights = auditData.keyInsights || [];
      return insights.filter(insight => insight && insight.trim() !== '');
    };

    const getHeuristicViolations = () => {
      const violations = auditData.heuristicViolations || [];
      return violations.filter((v: any) => v && v.title);
    };

    const getPrioritizedFixes = () => {
      const fixes = auditData.prioritizedFixes || [];
      return fixes.filter((f: any) => f && f.recommendation);
    };

    const getVisualDesignAudit = () => {
      return (auditData as any).visualDesignAudit;
    };

    const getUserJourney = () => {
      return (auditData as any).personaDrivenJourney;
    };

    const getCategoryScores = () => {
      const scores = auditData.scores;
      if (!scores) return [];

      const norm = (cat: any): number => {
        if (!cat) return 0;
        if (typeof cat.score === 'number' && typeof cat.maxScore === 'number' && cat.maxScore > 0) {
          return (cat.score / cat.maxScore) * 5;
        }
        if (typeof cat.percentage === 'number') {
          return (cat.percentage / 100) * 5;
        }
        return 0;
      };

      const categories = [];
      if (scores.heuristics) {
        categories.push({ label: 'Heuristics', score: norm(scores.heuristics) });
      }
      if (scores.uxLaws) {
        categories.push({ label: 'Usability', score: norm(scores.uxLaws) });
      }
      if (scores.accessibility) {
        categories.push({ label: 'Accessibility', score: norm(scores.accessibility) });
      }
      if (scores.copywriting) {
        categories.push({ label: 'Conversion', score: norm(scores.copywriting) });
      }

      return categories;
    };

    const getFaviconLetter = () => {
      if (auditData.url) {
        try {
          const domain = new URL(auditData.url).hostname;
          return domain.replace('www.', '').charAt(0).toUpperCase();
        } catch {
          return 'W';
        }
      }
      return 'W';
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return '#dc2626';
        case 'medium': return '#ea580c';
        case 'low': return '#16a34a';
        default: return '#6b7280';
      }
    };

    const getEffortColor = (effort: string) => {
      switch (effort) {
        case 'low': return '#10b981';
        case 'medium': return '#3b82f6';
        case 'high': return '#8b5cf6';
        default: return '#6b7280';
      }
    };

    // Build comprehensive HTML
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UX Audit Report - ${getPlatformName()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #fff;
      font-size: 14px;
    }
    .container { max-width: 100%; margin: 0 auto; padding: 20px; }

    /* Header Section with Pink Brand Color */
    .header {
      background: linear-gradient(135deg, #EF4171 0%, #D93A63 100%);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 30px;
      color: white;
    }
    .company-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .favicon {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .company-name { color: white; font-size: 14px; font-weight: 600; }
    .report-title { font-size: 28px; font-weight: bold; color: white; margin-bottom: 8px; }
    .audit-date { color: rgba(255, 255, 255, 0.9); font-size: 12px; margin-bottom: 20px; }

    .metrics-row { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
    .overall-score { text-align: center; }
    .score-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .score-label { font-size: 11px; font-weight: 600; color: white; }
    .category-scores { display: flex; gap: 12px; flex-wrap: wrap; }
    .category-score { text-align: center; }
    .category-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 6px;
    }

    .section { margin: 28px 0; page-break-inside: avoid; }
    .section-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 6px; }
    .section-subtitle { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.5; }

    /* Screenshot Section */
    .screenshot-container {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      page-break-inside: avoid;
    }
    .screenshot-img {
      width: 100%;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* Key Insights */
    .insights-list { list-style: none; margin-top: 12px; }
    .insights-list li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .bullet {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      margin-top: 7px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .insight-text { color: #374151; font-size: 13px; }

    /* Heuristic Violations */
    .violations-list { margin-top: 16px; }
    .violation-item {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      gap: 12px;
      page-break-inside: avoid;
    }
    .violation-number {
      width: 28px;
      height: 28px;
      background: #1f2937;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .violation-content { flex: 1; }
    .violation-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 6px; }
    .violation-description { color: #4b5563; font-size: 12px; line-height: 1.5; margin-bottom: 8px; }
    .heuristic-tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      display: inline-block;
      margin-bottom: 8px;
    }
    .business-impact {
      background: #fef3c7;
      padding: 10px;
      border-radius: 6px;
      margin-top: 8px;
    }
    .impact-label { font-weight: 600; color: #92400e; font-size: 11px; }
    .impact-text { color: #78350f; font-size: 12px; display: block; margin-top: 4px; }

    /* Prioritized Fixes */
    .fixes-list { margin-top: 16px; }
    .fix-item {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .fix-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
    .fix-number {
      width: 28px;
      height: 28px;
      background: #1f2937;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .fix-title { font-size: 14px; font-weight: 600; color: #111827; flex: 1; margin-left: 10px; }
    .fix-badges { display: flex; gap: 6px; }
    .priority-badge, .effort-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      color: white;
    }
    .fix-recommendation { color: #4b5563; font-size: 12px; line-height: 1.5; margin-bottom: 10px; }
    .fix-impact {
      background: #f0fdf4;
      padding: 10px;
      border-radius: 6px;
      border-left: 3px solid #10b981;
    }
    .fix-impact-label { font-weight: 600; color: #065f46; font-size: 11px; }
    .fix-impact-text { color: #047857; font-size: 12px; display: block; margin-top: 4px; }

    /* Visual Design Audit */
    .visual-design-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .visual-design-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      page-break-inside: avoid;
    }
    .visual-design-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px; }
    .visual-design-score {
      display: inline-flex;
      align-items: center;
      background: #f3f4f6;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .visual-design-issues, .visual-design-strengths {
      font-size: 11px;
      line-height: 1.5;
      margin-top: 6px;
    }
    .issue-item, .strength-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .issue-bullet { color: #dc2626; margin-right: 6px; }
    .strength-bullet { color: #10b981; margin-right: 6px; }

    /* User Journey */
    .journey-persona {
      background: #f9fafb;
      padding: 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 4px solid #EF4171;
    }
    .journey-persona-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px; }
    .journey-persona-text { font-size: 12px; color: #4b5563; line-height: 1.5; }

    .journey-steps { margin-top: 16px; }
    .journey-step {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .journey-step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .journey-step-number {
      width: 26px;
      height: 26px;
      background: #EF4171;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .journey-step-stage {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
      text-transform: capitalize;
      flex: 1;
      margin-left: 10px;
    }
    .journey-emotional-state {
      background: #fef3c7;
      color: #92400e;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .journey-goal { font-size: 12px; color: #4b5563; margin-bottom: 10px; font-style: italic; }
    .journey-experience { font-size: 11px; color: #6b7280; line-height: 1.5; margin-bottom: 10px; }
    .journey-section-title { font-size: 11px; font-weight: 600; color: #374151; margin-top: 8px; margin-bottom: 4px; }
    .journey-list { font-size: 11px; color: #4b5563; line-height: 1.5; padding-left: 16px; }

    @media print {
      .container { padding: 10px; }
      .section { margin: 20px 0; }
      .violation-item, .fix-item, .journey-step, .visual-design-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Header Section -->
    <div class="header">
      <div class="company-info">
        <div class="favicon">${getFaviconLetter()}</div>
        <div class="company-name">${getPlatformName()}</div>
      </div>
      <h1 class="report-title">UX Audit Report</h1>
      <div class="audit-date">Audited: ${new Date(auditData.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>

      ${(auditData as any).scores?.overall || getCategoryScores().length > 0 ? `
      <div class="metrics-row">
        ${(auditData as any).scores?.overall ? `
        <div class="overall-score">
          <div class="score-circle">${(() => {
            const ov = (auditData as any).scores?.overall || {};
            const val = (typeof ov.score === 'number' && typeof ov.maxScore === 'number' && ov.maxScore > 0)
              ? (ov.score / ov.maxScore) * 5
              : (typeof ov.percentage === 'number' ? (ov.percentage / 100) * 5 : 0);
            return val.toFixed(1);
          })()}/5</div>
          <div class="score-label">Overall UX Score</div>
        </div>
        ` : ''}

        ${getCategoryScores().length > 0 ? `
        <div class="category-scores">
          ${getCategoryScores().map(category => `
            <div class="category-score">
              <div class="category-circle">${Number.isFinite(category.score) ? category.score.toFixed(1) + '/5' : '0.0/5'}</div>
              <div class="score-label">${category.label}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>

    <!-- Summary Section -->
    <div class="section">
      <h2 class="section-title">${getPlatformName().split('.')[0].charAt(0).toUpperCase() + getPlatformName().split('.')[0].slice(1)}</h2>
      <p class="section-subtitle">${auditData.summary || 'Comprehensive UX analysis of the platform.'}</p>
    </div>

    <!-- Key Insights Section -->
    ${getKeyInsights().length > 0 ? `
    <div class="section">
      <h2 class="section-title">Key Insights</h2>
      <p class="section-subtitle">Critical findings and opportunities identified through AI analysis.</p>
      <ul class="insights-list">
        ${getKeyInsights().map(insight => `
          <li>
            <span class="bullet"></span>
            <span class="insight-text">${insight}</span>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Screenshot Section -->
    ${auditData.imageUrl ? `
    <div class="section">
      <h2 class="section-title">Analysis Screenshot</h2>
      <p class="section-subtitle">Visual analysis of the platform interface.</p>
      <div class="screenshot-container">
        <img src="${auditData.imageUrl}" alt="Website Screenshot" class="screenshot-img" />
      </div>
    </div>
    ` : ''}

    <!-- Heuristic Violations Section -->
    ${getHeuristicViolations().length > 0 ? `
    <div class="section">
      <h2 class="section-title">Heuristic Violations</h2>
      <p class="section-subtitle">Identified issues based on Nielsen's 10 Usability Heuristics.</p>
      <div class="violations-list">
        ${getHeuristicViolations().map((violation: any, index: number) => `
          <div class="violation-item">
            <div class="violation-number">${index + 1}</div>
            <div class="violation-content">
              ${violation.title ? `<div class="violation-title">${violation.title}</div>` : ''}
              <p class="violation-description">${violation.violation || violation.description || ''}</p>
              ${violation.heuristic ? `<div class="heuristic-tag">${violation.heuristic}</div>` : ''}
              ${violation.businessImpact ? `
              <div class="business-impact">
                <span class="impact-label">Business Impact:</span>
                <span class="impact-text">${violation.businessImpact}</span>
              </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Prioritized Fixes Section -->
    ${getPrioritizedFixes().length > 0 ? `
    <div class="section">
      <h2 class="section-title">Prioritized Recommendations</h2>
      <p class="section-subtitle">Actionable fixes ranked by impact and effort, with measurable business outcomes.</p>
      <div class="fixes-list">
        ${getPrioritizedFixes().map((fix: any, index: number) => `
          <div class="fix-item">
            <div class="fix-header">
              <div style="display: flex; align-items: center; flex: 1;">
                <div class="fix-number">${index + 1}</div>
                <div class="fix-title">${fix.title || fix.recommendation?.substring(0, 60) || 'Recommendation'}</div>
              </div>
              <div class="fix-badges">
                ${fix.priority ? `<span class="priority-badge" style="background-color: ${getPriorityColor(fix.priority)};">${fix.priority.charAt(0).toUpperCase() + fix.priority.slice(1)} Priority</span>` : ''}
                ${fix.effort ? `<span class="effort-badge" style="background-color: ${getEffortColor(fix.effort)};">${fix.effort.charAt(0).toUpperCase() + fix.effort.slice(1)} Effort</span>` : ''}
              </div>
            </div>
            <p class="fix-recommendation">${fix.recommendation || ''}</p>
            ${fix.businessImpact ? `
            <div class="fix-impact">
              <span class="fix-impact-label">Expected Impact:</span>
              <span class="fix-impact-text">${fix.businessImpact}</span>
            </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Visual Design Audit Section -->
    ${getVisualDesignAudit() ? `
    <div class="section">
      <h2 class="section-title">Visual Design Audit</h2>
      <p class="section-subtitle">Assessment of visual hierarchy, typography, color contrast, and spacing.</p>
      <div class="visual-design-grid">
        ${getVisualDesignAudit().visualHierarchy ? `
        <div class="visual-design-card">
          <div class="visual-design-title">Visual Hierarchy</div>
          <div class="visual-design-score">${getVisualDesignAudit().visualHierarchy.score}/5</div>
          ${getVisualDesignAudit().visualHierarchy.issues?.length > 0 ? `
          <div class="visual-design-issues">
            ${getVisualDesignAudit().visualHierarchy.issues.map((issue: string) => `
              <div class="issue-item"><span class="issue-bullet">●</span> ${issue}</div>
            `).join('')}
          </div>
          ` : ''}
          ${getVisualDesignAudit().visualHierarchy.strengths?.length > 0 ? `
          <div class="visual-design-strengths">
            ${getVisualDesignAudit().visualHierarchy.strengths.map((strength: string) => `
              <div class="strength-item"><span class="strength-bullet">●</span> ${strength}</div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${getVisualDesignAudit().typography ? `
        <div class="visual-design-card">
          <div class="visual-design-title">Typography</div>
          <div class="visual-design-score">${getVisualDesignAudit().typography.score}/5</div>
          ${getVisualDesignAudit().typography.issues?.length > 0 ? `
          <div class="visual-design-issues">
            ${getVisualDesignAudit().typography.issues.map((issue: string) => `
              <div class="issue-item"><span class="issue-bullet">●</span> ${issue}</div>
            `).join('')}
          </div>
          ` : ''}
          ${getVisualDesignAudit().typography.strengths?.length > 0 ? `
          <div class="visual-design-strengths">
            ${getVisualDesignAudit().typography.strengths.map((strength: string) => `
              <div class="strength-item"><span class="strength-bullet">●</span> ${strength}</div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${getVisualDesignAudit().colorContrast ? `
        <div class="visual-design-card">
          <div class="visual-design-title">Color Contrast</div>
          <div class="visual-design-score">${getVisualDesignAudit().colorContrast.score}/5</div>
          ${getVisualDesignAudit().colorContrast.issues?.length > 0 ? `
          <div class="visual-design-issues">
            ${getVisualDesignAudit().colorContrast.issues.map((issue: string) => `
              <div class="issue-item"><span class="issue-bullet">●</span> ${issue}</div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${getVisualDesignAudit().spacing ? `
        <div class="visual-design-card">
          <div class="visual-design-title">Spacing & Layout</div>
          <div class="visual-design-score">${getVisualDesignAudit().spacing.score}/5</div>
          ${getVisualDesignAudit().spacing.issues?.length > 0 ? `
          <div class="visual-design-issues">
            ${getVisualDesignAudit().spacing.issues.map((issue: string) => `
              <div class="issue-item"><span class="issue-bullet">●</span> ${issue}</div>
            `).join('')}
          </div>
          ` : ''}
          ${getVisualDesignAudit().spacing.strengths?.length > 0 ? `
          <div class="visual-design-strengths">
            ${getVisualDesignAudit().spacing.strengths.map((strength: string) => `
              <div class="strength-item"><span class="strength-bullet">●</span> ${strength}</div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- User Journey Section -->
    ${getUserJourney() && getUserJourney().persona ? `
    <div class="section">
      <h2 class="section-title">User Journey Analysis</h2>
      <p class="section-subtitle">Persona-driven analysis of user experience across key stages.</p>

      <div class="journey-persona">
        <div class="journey-persona-title">Primary Persona: ${getUserJourney().persona}</div>
        ${getUserJourney().personaReasoning ? `
        <div class="journey-persona-text">${getUserJourney().personaReasoning}</div>
        ` : ''}
      </div>

      ${getUserJourney().steps?.length > 0 ? `
      <div class="journey-steps">
        ${getUserJourney().steps.map((step: any) => `
          <div class="journey-step">
            <div class="journey-step-header">
              <div style="display: flex; align-items: center; flex: 1;">
                <div class="journey-step-number">${step.step || '•'}</div>
                <div class="journey-step-stage">${step.stage || 'Stage'}</div>
              </div>
              ${step.emotionalState ? `<div class="journey-emotional-state">${step.emotionalState}</div>` : ''}
            </div>
            ${step.userGoal ? `<div class="journey-goal">"${step.userGoal}"</div>` : ''}
            ${step.currentExperience ? `<div class="journey-experience">${step.currentExperience}</div>` : ''}
            ${step.frictionPoints?.length > 0 ? `
            <div class="journey-section-title">Friction Points:</div>
            <ul class="journey-list">
              ${step.frictionPoints.map((point: string) => `<li>${point}</li>`).join('')}
            </ul>
            ` : ''}
            ${step.trustBarriers?.length > 0 ? `
            <div class="journey-section-title">Trust Barriers:</div>
            <ul class="journey-list">
              ${step.trustBarriers.map((barrier: string) => `<li>${barrier}</li>`).join('')}
            </ul>
            ` : ''}
            ${step.improvements?.length > 0 ? `
            <div class="journey-section-title">Improvements:</div>
            <ul class="journey-list">
              ${step.improvements.map((improvement: string) => `<li>${improvement}</li>`).join('')}
            </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${getUserJourney().keyTakeaway ? `
      <div class="journey-persona" style="margin-top: 16px; border-left-color: #10b981;">
        <div class="journey-persona-title">Key Takeaway</div>
        <div class="journey-persona-text">${getUserJourney().keyTakeaway}</div>
      </div>
      ` : ''}
    </div>
    ` : ''}

  </div>
</body>
</html>
    `;

    return html;
  }
}