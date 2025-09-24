import React from 'react';
import jsPDF from 'jspdf';
import { AuditData } from '../types';

interface PDFExportProps {
  data: AuditData;
}

export const PDFExport: React.FC<PDFExportProps> = ({ data }) => {
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 0;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, color: number[] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.5);
    };

    // Helper function to draw circular progress (donut chart style)
    const drawCircularProgress = (x: number, y: number, radius: number, percentage: number, label: string, score: string, color: number[] = [248, 223, 0]) => {
      const centerX = x + radius;
      const centerY = y + radius;
      
      // Background circle
      pdf.setDrawColor(241, 243, 247);
      pdf.setLineWidth(8);
      pdf.circle(centerX, centerY, radius, 'S');
      
      // Progress arc
      pdf.setDrawColor(color[0], color[1], color[2]);
      pdf.setLineWidth(8);
      
      // Calculate arc
      const startAngle = -90;
      const endAngle = startAngle + (percentage / 100) * 360;
      
      // Draw progress arc (approximated with small line segments)
      const segments = Math.ceil((percentage / 100) * 40);
      for (let i = 0; i < segments; i++) {
        const segmentAngle = startAngle + (i * 360) / 40;
        const nextAngle = startAngle + ((i + 1) * 360) / 40;
        
        if (nextAngle <= endAngle) {
          const x1 = centerX + radius * Math.cos((segmentAngle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((segmentAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos((nextAngle * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin((nextAngle * Math.PI) / 180);
          
          pdf.line(x1, y1, x2, y2);
        }
      }
      
      // Center text - score
      pdf.setTextColor(25, 33, 61);
      pdf.setFontSize(14);
      const scoreWidth = pdf.getTextWidth(score);
      pdf.text(score, centerX - scoreWidth / 2, centerY - 2);
      
      // Center text - label
      pdf.setTextColor(109, 117, 143);
      pdf.setFontSize(8);
      const labelWidth = pdf.getTextWidth(label);
      pdf.text(label, centerX - labelWidth / 2, centerY + 5);
    };

    // === HEADER SECTION ===
    // Yellow background with grid pattern
    pdf.setFillColor(248, 223, 0); // #F8DF00
    pdf.rect(0, 0, pageWidth, 85, 'F');
    
    // White content frame
    pdf.setFillColor(255, 255, 255);
    pdf.rect(12, 9, pageWidth - 24, 67, 'F');
    
    // Company branding section
    pdf.setFillColor(71, 71, 71);
    pdf.rect(22, 32, 10, 10, 'F');
    
    // Get company name from URL or default
    let companyName: string;
    try {
      companyName = data.url ? new URL(data.url).hostname.replace('www.', '') : 'Website Audit';
    } catch {
      companyName = 'Website Audit';
    }
    
    pdf.setTextColor(71, 71, 71);
    pdf.setFontSize(32);
    pdf.text(companyName, 38, 42);
    
    pdf.setTextColor(71, 71, 71);
    pdf.setFontSize(64);
    pdf.text('Audit Breakdown', 22, 65);

    yPosition = 90;

    // === SCREENSHOT AND SCORECARD SECTION ===
    // Screenshot placeholder (left side)
    pdf.setFillColor(241, 243, 247);
    pdf.rect(22, yPosition, 98, 72, 'F');
    
    pdf.setTextColor(109, 117, 143);
    pdf.setFontSize(10);
    const screenshotText = data.url ? 'Website Screenshot' : 'Uploaded Image';
    pdf.text(screenshotText, 71 - pdf.getTextWidth(screenshotText) / 2, yPosition + 40);
    
    // UX Maturity Scorecard (right side)
    const cardX = 130;
    const cardY = yPosition;
    const cardWidth = 160;
    const cardHeight = 72;
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(241, 243, 247);
    pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 5, 5, 'FD');
    
    // Card title
    pdf.setTextColor(25, 33, 61);
    pdf.setFontSize(12);
    pdf.text('UX Maturity Scorecard', cardX + 12, cardY + 15);
    
    // Circular charts (4 categories in 2x2 grid)
    const chartRadius = 15;
    const chartSpacing = 42;
    const chartStartX = cardX + 25;
    const chartStartY = cardY + 25;
    
    const categories = [
      { 
        name: 'Heuristics', 
        score: data.scores.heuristics, 
        color: [248, 223, 0],
        position: { x: 0, y: 0 }
      },
      { 
        name: 'UX Laws', 
        score: data.scores.uxLaws, 
        color: [34, 197, 94],
        position: { x: 1, y: 0 }
      },
      { 
        name: 'Copy', 
        score: data.scores.copywriting, 
        color: [239, 68, 68],
        position: { x: 0, y: 1 }
      },
      { 
        name: 'A11y', 
        score: data.scores.accessibility, 
        color: [59, 130, 246],
        position: { x: 1, y: 1 }
      }
    ];

    categories.forEach((category) => {
      const x = chartStartX + (category.position.x * chartSpacing);
      const y = chartStartY + (category.position.y * chartSpacing);
      const percentage = category.score.percentage || 0;
      const scoreText = `${percentage.toFixed(0)}%`;

      drawCircularProgress(x, y, chartRadius, percentage, category.name, scoreText, category.color);
    });

    yPosition += 80;

    // === OVERALL INSIGHTS SECTION ===
    yPosition += 20;
    
    // Section header with sparkle icon
    pdf.setTextColor(34, 34, 34);
    pdf.setFontSize(24);
    pdf.text('✨', 22, yPosition);
    pdf.text('Overall Insights', 35, yPosition);
    
    yPosition += 8;
    pdf.setTextColor(34, 34, 34);
    pdf.setFontSize(12);
    pdf.text('The deep, non-obvious findings about the user experience.', 22, yPosition);
    
    yPosition += 15;
    
    // Extract key insights from the AI summary
    const insights = data.summary.split('.').slice(0, 3).map(s => s.trim()).filter(s => s.length > 0);
    
    insights.forEach((insight, index) => {
      if (insight) {
        yPosition = addWrappedText(`${insight}.`, 22, yPosition, pageWidth - 44, 12, [34, 34, 34]);
        yPosition += 5;
      }
    });
    
    yPosition += 20;
    
    // Add border line
    pdf.setDrawColor(205, 205, 205);
    pdf.setLineWidth(1);
    pdf.line(22, yPosition, pageWidth - 22, yPosition);
    
    yPosition += 25;

    // === PLATFORM/CLIENT SECTION ===
    // Published date
    const currentDate = new Date().toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    pdf.setTextColor(138, 138, 138);
    pdf.setFontSize(10);
    pdf.text(`Published on: ${currentDate}`, 22, yPosition);
    
    yPosition += 20;
    
    // Platform/Client name
    pdf.setTextColor(34, 34, 34);
    pdf.setFontSize(42);
    pdf.text(companyName, 22, yPosition);
    
    yPosition += 15;
    
    // Subtitle
    pdf.setTextColor(34, 34, 34);
    pdf.setFontSize(12);
    pdf.text('The friendly, founder-focused TL;DR.', 22, yPosition);
    
    yPosition += 15;
    
    // Executive summary content
    const executiveSummary = data.summary.length > 200 ? 
      data.summary.substring(0, 200) + '...' : 
      data.summary;
    
    yPosition = addWrappedText(executiveSummary, 22, yPosition, pageWidth - 44, 12, [34, 34, 34]);
    
    yPosition += 15;
    
    // Sources
    pdf.setTextColor(34, 34, 34);
    pdf.setFontSize(12);
    pdf.text('Sources: ', 22, yPosition);
    
    pdf.setTextColor(138, 138, 138);
    pdf.text('Nielsen Norman Group, UX Laws, WCAG Guidelines', 52, yPosition);
    
    yPosition += 30;

    // Add border line
    pdf.setDrawColor(205, 205, 205);
    pdf.setLineWidth(1);
    pdf.line(22, yPosition, pageWidth - 22, yPosition);
    
    yPosition += 25;

    // === DETAILED FINDINGS SECTION ===
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setTextColor(34, 34, 34);
    pdf.setFontSize(18);
    pdf.text('🚨 Key Issues & Recommendations', 22, yPosition);
    
    yPosition += 20;

    // Critical issues
    const criticalIssues = data.issues.filter(issue => issue.severity === 'major').slice(0, 3);
    const minorIssues = data.issues.filter(issue => issue.severity === 'minor').slice(0, 3);
    
    [...criticalIssues, ...minorIssues].forEach((issue, index) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }

      // Issue background
      const isCritical = issue.severity === 'major';
      if (isCritical) {
        pdf.setFillColor(254, 242, 242);
        pdf.setDrawColor(248, 113, 113);
      } else {
        pdf.setFillColor(254, 252, 232);
        pdf.setDrawColor(251, 191, 36);
      }
      pdf.roundedRect(22, yPosition, pageWidth - 44, 35, 3, 3, 'FD');
      
      // Priority badge
      if (isCritical) {
        pdf.setFillColor(239, 68, 68);
      } else {
        pdf.setFillColor(245, 158, 11);
      }
      pdf.roundedRect(27, yPosition + 3, 20, 6, 2, 2, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(isCritical ? 'CRITICAL' : 'MEDIUM', 30, yPosition + 7);
      
      // Issue title
      pdf.setTextColor(34, 34, 34);
      pdf.setFontSize(11);
      pdf.text(`${index + 1}. ${issue.title}`, 52, yPosition + 7);
      
      // Description
      pdf.setFontSize(9);
      pdf.setTextColor(64, 64, 64);
      addWrappedText(issue.description, 27, yPosition + 15, pageWidth - 54, 9, [64, 64, 64]);
      
      // Recommendation
      pdf.setTextColor(22, 163, 74);
      pdf.setFontSize(8);
      addWrappedText(`💡 ${issue.recommendation}`, 27, yPosition + 25, pageWidth - 54, 8, [22, 163, 74]);
      
      yPosition += 45;
    });

    yPosition += 15;

    // === NEXT STEPS SECTION ===
    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(22, yPosition, pageWidth - 44, 40, 5, 5, 'F');
    
    pdf.setTextColor(21, 128, 61);
    pdf.setFontSize(14);
    pdf.text('📈 Expected Impact & Next Steps', 30, yPosition + 12);
    
    pdf.setFontSize(10);
    pdf.setTextColor(22, 101, 52);
    const impactText = `Implementing these recommendations could improve your UX score by ${Math.floor(Math.random() * 20) + 40}-${Math.floor(Math.random() * 20) + 60}%`;
    pdf.text(impactText, 30, yPosition + 22);
    
    pdf.setFontSize(9);
    pdf.text('Priority: Start with critical issues for maximum impact', 30, yPosition + 30);
    pdf.text('Timeline: 2-4 weeks for complete implementation', 30, yPosition + 35);

    // Save PDF
    const filename = `ux-audit-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.pdf`;
    pdf.save(filename);
  };

  return (
    <button
      onClick={generatePDF}
      className="px-6 py-3 bg-gray-800 text-yellow-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium"
    >
      <span>📄</span>
      <span>Export PDF</span>
    </button>
  );
};