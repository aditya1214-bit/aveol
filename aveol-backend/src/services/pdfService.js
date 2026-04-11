const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Color palette matching AVEOL brand
const COLORS = {
  primary: '#6C63FF',    // Purple
  dark: '#0D0D0D',       // Near black
  accent: '#00E5FF',     // Cyan
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#888888',
  success: '#00C48C',
  warning: '#FFB547',
};

/**
 * Generate a branded PDF audit report
 */
const generateAuditPDF = async (client, auditResponse) => {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const filename = `aveol-audit-${client._id}-${Date.now()}.pdf`;
      const outputPath = path.join(outputDir, filename);
      const writeStream = fs.createWriteStream(outputPath);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `AVEOL AI Automation Audit — ${client.companyName}`,
          Author: 'AVEOL AI Automation Agency',
          Subject: 'Business Automation Audit Report',
          Creator: 'AVEOL Platform',
        },
      });

      doc.pipe(writeStream);

      const analysis = auditResponse.aiAnalysis;
      const pageWidth = doc.page.width - 100; // accounting for margins

      // ── Cover Page ───────────────────────────────────────────────
      // Background header bar
      doc.rect(0, 0, doc.page.width, 200).fill(COLORS.dark);

      // AVEOL Logo text
      doc
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor(COLORS.white)
        .text('AVEOL', 50, 60);

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(COLORS.accent)
        .text('AUTONOMOUS INTELLIGENCE. INFINITE SCALE.', 50, 100);

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(COLORS.white)
        .text('AI AUTOMATION AUDIT REPORT', 50, 130);

      // Report for company
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(COLORS.primary)
        .text(`Prepared for: ${client.companyName}`, 50, 220);

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(COLORS.dark)
        .text(`Contact: ${client.name}  |  ${client.email}`, 50, 245)
        .text(`Industry: ${client.industry}  |  Team Size: ${client.teamSize}`, 50, 262)
        .text(`Report Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 50, 279);

      // Audit Score Badge
      doc.rect(50, 310, pageWidth, 80).fill(COLORS.light).stroke(COLORS.primary);
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(COLORS.dark)
        .text('AUTOMATION OPPORTUNITY SCORE', 70, 325);

      const score = analysis.auditScore || 0;
      const scoreColor = score >= 75 ? COLORS.success : score >= 50 ? COLORS.primary : COLORS.warning;
      doc
        .font('Helvetica-Bold')
        .fontSize(42)
        .fillColor(scoreColor)
        .text(`${score}/100`, 70, 340, { continued: false });

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(COLORS.gray)
        .text(`Readiness Level: ${analysis.automationReadinessLevel || 'Medium'}`, 200, 352);

      doc.moveDown(2);

      // ── Executive Summary ────────────────────────────────────────
      sectionHeader(doc, 'EXECUTIVE SUMMARY', COLORS);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(COLORS.dark)
        .text(analysis.executiveSummary || 'Analysis in progress.', 50, doc.y + 8, {
          width: pageWidth,
          lineGap: 4,
        });

      doc.moveDown(1.5);

      // ── Key Metrics ───────────────────────────────────────────────
      sectionHeader(doc, 'ESTIMATED IMPACT', COLORS);
      doc.moveDown(0.5);

      const savings = analysis.estimatedAnnualSavings || {};
      metricBox(doc, 50, doc.y, 160, 'Hours Saved/Year', `${(savings.timeHours || 0).toLocaleString()} hrs`, COLORS);
      metricBox(doc, 230, doc.y - 60, 160, 'Annual Savings', formatINR(savings.moneyINR || 0), COLORS);
      metricBox(doc, 410, doc.y - 60, 160, 'Agents Recommended', `${(analysis.recommendedAgents || []).length}`, COLORS);

      doc.moveDown(3);

      // ── Identified Opportunities ─────────────────────────────────
      sectionHeader(doc, 'AUTOMATION OPPORTUNITIES IDENTIFIED', COLORS);
      doc.moveDown(0.5);

      (analysis.identifiedOpportunities || []).forEach((opp, i) => {
        if (doc.y > 720) doc.addPage();
        const priorityColor =
          opp.priority === 'Critical' ? '#FF4444' :
          opp.priority === 'High' ? COLORS.primary :
          opp.priority === 'Medium' ? COLORS.warning : COLORS.gray;

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(COLORS.dark)
          .text(`${i + 1}. ${opp.area}`, 50, doc.y + 4);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(COLORS.gray)
          .text(opp.description, 65, doc.y + 2, { width: pageWidth - 15 });

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(priorityColor)
          .text(
            `Priority: ${opp.priority}   |   Est. Time Saved: ${opp.estimatedTimeSavedPerWeek} hrs/week`,
            65,
            doc.y + 2
          );

        doc.moveDown(0.6);
      });

      // ── Recommended AI Agents ─────────────────────────────────────
      if (doc.y > 650) doc.addPage();
      sectionHeader(doc, 'RECOMMENDED AI AGENTS', COLORS);
      doc.moveDown(0.5);

      (analysis.recommendedAgents || []).forEach((agent, i) => {
        if (doc.y > 700) doc.addPage();
        doc.rect(50, doc.y, pageWidth, 70).fill('#F9F7FF').stroke(COLORS.primary);

        const boxY = doc.y + 8;
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(COLORS.primary)
          .text(`🤖  ${agent.agentName}`, 65, boxY);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(COLORS.dark)
          .text(agent.description, 65, boxY + 16, { width: pageWidth - 30 });

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.success)
          .text(
            `ROI: ${agent.estimatedROI}   |   Time to Deploy: ${agent.implementationTime}`,
            65,
            boxY + 46
          );

        doc.moveDown(0.3).y += 72;
      });

      // ── Quick Wins ────────────────────────────────────────────────
      if ((analysis.quickWins || []).length > 0) {
        if (doc.y > 650) doc.addPage();
        sectionHeader(doc, '⚡ QUICK WIN AUTOMATION ACTIONS', COLORS);
        doc.moveDown(0.5);
        (analysis.quickWins || []).forEach((win) => {
          doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor(COLORS.dark)
            .text(`→  ${win}`, 65, doc.y + 3, { width: pageWidth - 15 });
          doc.moveDown(0.4);
        });
      }

      // ── Recommended Tech Stack ───────────────────────────────────
      if ((analysis.recommendedStack || []).length > 0) {
        if (doc.y > 650) doc.addPage();
        doc.moveDown(1);
        sectionHeader(doc, 'RECOMMENDED AUTOMATION STACK', COLORS);
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(COLORS.dark)
          .text((analysis.recommendedStack || []).join('  •  '), 50, doc.y + 8, {
            width: pageWidth,
          });
      }

      // ── CTA Page ──────────────────────────────────────────────────
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.dark);

      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor(COLORS.white)
        .text('Ready to Automate?', 50, 120, { align: 'center', width: pageWidth + 50 });

      doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor(COLORS.accent)
        .text(
          'Book your free 30-minute strategy call with the AVEOL team.\nWe will walk you through exactly how to implement these automations.',
          50, 175,
          { align: 'center', width: pageWidth + 50, lineGap: 6 }
        );

      // CTA button visual
      doc.rect(doc.page.width / 2 - 140, 260, 280, 50).fill(COLORS.primary);
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(COLORS.white)
        .text('Book Your Strategy Call →', doc.page.width / 2 - 140, 278, {
          width: 280,
          align: 'center',
        });

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(COLORS.gray)
        .text(
          process.env.CALENDLY_BOOKING_URL || 'https://calendly.com/aveol/strategy-call',
          50, 330,
          { align: 'center', width: pageWidth + 50 }
        );

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(COLORS.gray)
        .text('hello@aveol.ai  |  aveol.netlify.app', 50, 380, {
          align: 'center',
          width: pageWidth + 50,
        });

      // ── Footer on all pages ───────────────────────────────────────
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count - 1; i++) {
        doc.switchToPage(range.start + i);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(COLORS.gray)
          .text(
            `© ${new Date().getFullYear()} AVEOL AI Automation Agency  |  Confidential  |  Page ${i + 1}`,
            50,
            doc.page.height - 30,
            { align: 'center', width: pageWidth }
          );
      }

      doc.end();

      writeStream.on('finish', () => {
        logger.info(`PDF generated: ${filename}`);
        resolve({ path: outputPath, filename });
      });

      writeStream.on('error', reject);
    } catch (err) {
      logger.error('PDF generation error:', err);
      reject(err);
    }
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const sectionHeader = (doc, title, colors) => {
  doc.rect(50, doc.y, doc.page.width - 100, 26).fill(colors.primary);
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(colors.white)
    .text(title, 60, doc.y - 20);
  doc.moveDown(0.3);
};

const metricBox = (doc, x, y, width, label, value, colors) => {
  doc.rect(x, y, width, 55).fill(colors.light).stroke(colors.primary);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(colors.gray)
    .text(label, x + 5, y + 8, { width: width - 10, align: 'center' });
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor(colors.primary)
    .text(value, x + 5, y + 22, { width: width - 10, align: 'center' });
};

const formatINR = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

module.exports = { generateAuditPDF };
