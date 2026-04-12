const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const Client = require('../models/Client');
const AuditResponse = require('../models/AuditResponse');
const { analyzeBusinessAudit, calculateLeadScore, determinePriority } = require('../services/aiAnalysisService');
const { generateAuditPDF } = require('../services/pdfService');
const { sendAuditReportEmail, sendAdminNotification } = require('../services/emailService');
const { notifyNewLead } = require('../services/slackService');
const logger = require('../utils/logger');

// ── Shared Gmail transporter ──────────────────────────────────────────────────
const createGmailTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// ── Simple admin notification helper (used for waitlist) ─────────────────────
const notifyAdmin = async (subject, htmlBody) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  try {
    await createGmailTransporter().sendMail({
      from: process.env.GMAIL_USER,
      to: 'rajaditya81156@gmail.com',
      subject,
      html: htmlBody,
    });
  } catch (err) {
    logger.error('Admin notify failed:', err.message);
  }
};

/**
 * POST /api/audit/submit
 * Handles full multi-step audit form submission
 */
const submitAudit = async (req, res) => {
  try {
    const {
      // Client Info
      name, email, companyName, industry, teamSize, companyRole,
      // Audit Step 1
      currentTools, otherTools,
      // Audit Step 2
      biggestBottlenecks, repetitiveTasks, salesProblems,
      customerSupportProblems, leadGenIssues, crmIssues, operationsTasks,
      // Audit Step 3
      monthlyBusinessVolume, budgetRange, automationGoals, timeline,
      previousAutomationExperience,
      // Spam protection
      _honey,
      // UTM / source
      utmSource, utmMedium, utmCampaign,
    } = req.body;

    // ── Honeypot check ───────────────────────────────────────────
    if (_honey) {
      logger.warn(`Honeypot triggered from IP: ${req.ip}`);
      // Return 200 to fool bots
      return res.status(200).json({ success: true, message: 'Submission received.' });
    }

    // ── Upsert client (allow re-submission by same email) ────────
    let client = await Client.findOne({ email: email.toLowerCase().trim() });

    if (client) {
      // Update existing
      client.name = name;
      client.companyName = companyName;
      client.industry = industry;
      client.teamSize = teamSize;
      client.companyRole = companyRole;
      client.status = 'audit_submitted';
      client.ipAddress = req.ip;
      client.userAgent = req.headers['user-agent'];
    } else {
      client = new Client({
        name,
        email,
        companyName,
        industry,
        teamSize,
        companyRole,
        status: 'audit_submitted',
        source: 'website',
        utmSource,
        utmMedium,
        utmCampaign,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    // ── Create audit response ─────────────────────────────────────
    const auditData = {
      currentTools: Array.isArray(currentTools) ? currentTools : currentTools?.split(',').map(t => t.trim()) || [],
      otherTools,
      biggestBottlenecks,
      repetitiveTasks,
      salesProblems,
      customerSupportProblems,
      leadGenIssues,
      crmIssues,
      operationsTasks,
      monthlyBusinessVolume,
      budgetRange,
      automationGoals,
      timeline,
      previousAutomationExperience,
      submissionToken: uuidv4(),
      analysisStatus: 'processing',
    };

    // Save client first to get ID
    await client.save();
    auditData.client = client._id;

    const auditResponse = await AuditResponse.create(auditData);

    // Link audit to client
    client.auditResponse = auditResponse._id;
    await client.save();

    // ── Respond to user immediately (don't block on AI) ──────────
    res.status(202).json({
      success: true,
      message: 'Audit submitted successfully. Your report will be emailed within a few minutes.',
      data: {
        clientId: client._id,
        auditId: auditResponse._id,
        submissionToken: auditResponse.submissionToken,
      },
    });

    // ── Process AI analysis in background ───────────────────────
    processAuditAnalysis(client, auditResponse, auditData).catch((err) =>
      logger.error('Background audit processing failed:', err)
    );

  } catch (err) {
    logger.error('submitAudit error:', err);

    if (err.code === 11000) {
      // Email already has a pending audit; just proceed
      return res.status(200).json({
        success: true,
        message: 'We already have your details on file. Your updated submission is being processed.',
      });
    }

    res.status(500).json({ success: false, message: 'Failed to process submission. Please try again.' });
  }
};

/**
 * Background processing: AI analysis → Lead scoring → PDF → Email
 */
const processAuditAnalysis = async (client, auditResponse, auditData) => {
  try {
    logger.info(`Processing audit for client: ${client._id}`);

    // ── AI Analysis ──────────────────────────────────────────────
    const aiAnalysis = await analyzeBusinessAudit(
      {
        companyName: client.companyName,
        industry: client.industry,
        teamSize: client.teamSize,
        companyRole: client.companyRole,
      },
      auditData
    );

    // ── Lead Scoring ─────────────────────────────────────────────
    const leadScore = calculateLeadScore(client, auditData, aiAnalysis);
    const priority = determinePriority(leadScore);

    // ── Update AuditResponse ─────────────────────────────────────
    await AuditResponse.findByIdAndUpdate(auditResponse._id, {
      aiAnalysis,
      analysisStatus: 'completed',
      analysisCompletedAt: new Date(),
    });

    // ── Update Client ────────────────────────────────────────────
    await Client.findByIdAndUpdate(client._id, {
      leadScore,
      priority,
      status: 'report_sent',
    });

    // Refresh for email
    const updatedClient = await Client.findById(client._id);
    const updatedAudit = await AuditResponse.findById(auditResponse._id);

    // ── Generate PDF ─────────────────────────────────────────────
    let pdfResult = null;
    try {
      pdfResult = await generateAuditPDF(updatedClient, updatedAudit);
      await AuditResponse.findByIdAndUpdate(auditResponse._id, {
        reportPdfPath: pdfResult.path,
      });
    } catch (pdfErr) {
      logger.error('PDF generation failed (non-critical):', pdfErr);
    }

    // ── Send client report email ─────────────────────────────────
    await sendAuditReportEmail(updatedClient, updatedAudit, pdfResult?.path);
    await Client.findByIdAndUpdate(client._id, { reportSentAt: new Date() });

    // ── Notify admin ─────────────────────────────────────────────
    await sendAdminNotification(
      { ...updatedClient.toObject(), leadScore, priority },
      updatedAudit,
      leadScore >= 70 ? 'high_value_lead' : 'new_lead'
    );

    // ── Slack notification ───────────────────────────────────────
    await notifyNewLead(
      { ...updatedClient.toObject(), leadScore, priority },
      updatedAudit
    );

    logger.info(`Audit fully processed for client: ${client._id} · Score: ${leadScore}`);

  } catch (err) {
    logger.error(`Audit processing failed for client ${client._id}:`, err);
    await AuditResponse.findByIdAndUpdate(auditResponse._id, {
      analysisStatus: 'failed',
      analysisError: err.message,
    });
  }
};

/**
 * GET /api/audit/status/:token
 * Client can poll for their audit status
 */
const getAuditStatus = async (req, res) => {
  try {
    const { token } = req.params;

    const audit = await AuditResponse.findOne({ submissionToken: token })
      .populate('client', 'name email companyName industry')
      .select('analysisStatus aiAnalysis.auditScore aiAnalysis.automationReadinessLevel createdAt analysisCompletedAt');

    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found.' });
    }

    res.json({
      success: true,
      data: {
        status: audit.analysisStatus,
        auditScore: audit.aiAnalysis?.auditScore,
        readinessLevel: audit.aiAnalysis?.automationReadinessLevel,
        submittedAt: audit.createdAt,
        completedAt: audit.analysisCompletedAt,
      },
    });
  } catch (err) {
    logger.error('getAuditStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/audit/waitlist
 * Simplified early access / waitlist form (from landing page)
 */
const joinWaitlist = async (req, res) => {
  try {
    const { email, companyRole, _honey } = req.body;

    if (_honey) {
      return res.status(200).json({ success: true });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Upsert
    await Client.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        $setOnInsert: {
          email: email.toLowerCase().trim(),
          name: 'Waitlist Signup',
          companyName: 'Unknown',
          industry: 'Other',
          source: 'website',
          status: 'new',
          companyRole,
          ipAddress: req.ip,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'You\'re on the waitlist! We\'ll be in touch soon.',
    });

    // Notify admin
    notifyAdmin(
      `🎯 New Waitlist Signup — ${email}`,
      `<h3>New Waitlist Signup</h3>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Role:</strong> ${companyRole || 'Not specified'}</p>
       <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>`
    );
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: 'You\'re already on our list!' });
    }
    logger.error('joinWaitlist error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { submitAudit, getAuditStatus, joinWaitlist };
