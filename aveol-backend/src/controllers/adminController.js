const jwt = require('jsonwebtoken');
const { stringify } = require('csv-stringify/sync');
const Client = require('../models/Client');
const AuditResponse = require('../models/AuditResponse');
const { BookedCall, Admin } = require('../models/BookedCall');
const { sendFollowUp1Email, sendFollowUp2Email } = require('../services/emailService');
const logger = require('../utils/logger');

// ── Auth ────────────────────────────────────────────────────────────────────────
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, registrationCode } = req.body;

    if (registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid registration code.' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Admin already exists.' });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully.',
      data: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    logger.error('registerAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      success: true,
      token,
      data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    logger.error('loginAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Lead Management ──────────────────────────────────────────────────────────────

/**
 * GET /api/admin/leads
 * Returns paginated, filtered, sorted leads
 */
const getAllLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      industry,
      status,
      priority,
      minScore,
      maxScore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = req.query;

    const filter = {};
    if (industry) filter.industry = industry;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (minScore || maxScore) {
      filter.leadScore = {};
      if (minScore) filter.leadScore.$gte = parseInt(minScore);
      if (maxScore) filter.leadScore.$lte = parseInt(maxScore);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('auditResponse', 'aiAnalysis.auditScore aiAnalysis.automationReadinessLevel aiAnalysis.recommendedAgents analysisStatus budgetRange timeline')
        .select('-__v'),
      Client.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: clients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    logger.error('getAllLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/leads/:id
 */
const getLeadById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('auditResponse')
      .populate('bookedCall');

    if (!client) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    res.json({ success: true, data: client });
  } catch (err) {
    logger.error('getLeadById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/admin/leads/:id/status
 */
const updateLeadStatus = async (req, res) => {
  try {
    const { status, priority, leadScore } = req.body;

    const update = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;
    if (leadScore !== undefined) update.leadScore = parseInt(leadScore);

    const client = await Client.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    res.json({ success: true, data: client });
  } catch (err) {
    logger.error('updateLeadStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/admin/leads/:id/notes
 */
const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          adminNotes: {
            note,
            addedAt: new Date(),
            addedBy: req.admin._id,
          },
        },
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    res.json({ success: true, data: client.adminNotes });
  } catch (err) {
    logger.error('addAdminNote error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/admin/leads/:id/followup
 * Manually trigger follow-up emails
 */
const triggerFollowUp = async (req, res) => {
  try {
    const { type } = req.body; // 'followup1' | 'followup2'
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (type === 'followup1') {
      await sendFollowUp1Email(client);
      await Client.findByIdAndUpdate(client._id, { followUp1SentAt: new Date(), status: 'follow_up_1' });
    } else if (type === 'followup2') {
      await sendFollowUp2Email(client);
      await Client.findByIdAndUpdate(client._id, { followUp2SentAt: new Date(), status: 'follow_up_2' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid follow-up type.' });
    }

    res.json({ success: true, message: `${type} sent successfully.` });
  } catch (err) {
    logger.error('triggerFollowUp error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/leads/export/csv
 * Export all leads as CSV
 */
const exportLeadsCSV = async (req, res) => {
  try {
    const clients = await Client.find({})
      .populate('auditResponse', 'aiAnalysis.auditScore budgetRange timeline monthlyBusinessVolume')
      .sort({ createdAt: -1 })
      .lean();

    const rows = clients.map((c) => ({
      Name: c.name,
      Email: c.email,
      Company: c.companyName,
      Industry: c.industry,
      'Team Size': c.teamSize,
      Status: c.status,
      'Lead Score': c.leadScore,
      Priority: c.priority,
      'Audit Score': c.auditResponse?.aiAnalysis?.auditScore || '',
      Budget: c.auditResponse?.budgetRange || '',
      Timeline: c.auditResponse?.timeline || '',
      Volume: c.auditResponse?.monthlyBusinessVolume || '',
      'Submitted At': new Date(c.createdAt).toLocaleDateString('en-IN'),
      'Report Sent': c.reportSentAt ? 'Yes' : 'No',
      'Call Booked': c.bookedCall ? 'Yes' : 'No',
      Source: c.source,
    }));

    const csv = stringify(rows, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=aveol-leads-${new Date().toISOString().slice(0, 10)}.csv`
    );
    res.send(csv);
  } catch (err) {
    logger.error('exportLeadsCSV error:', err);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
};

/**
 * GET /api/admin/dashboard
 * Key metrics for admin dashboard
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const [
      totalLeads,
      hotLeads,
      consultationsBooked,
      convertedLeads,
      avgLeadScore,
      recentLeads,
      leadsByIndustry,
      leadsByStatus,
    ] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ priority: 'hot' }),
      Client.countDocuments({ status: 'consultation_booked' }),
      Client.countDocuments({ status: 'converted' }),
      Client.aggregate([{ $group: { _id: null, avg: { $avg: '$leadScore' } } }]),
      Client.find({}).sort({ createdAt: -1 }).limit(5).select('name companyName industry leadScore priority status createdAt'),
      Client.aggregate([{ $group: { _id: '$industry', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Client.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          hotLeads,
          consultationsBooked,
          convertedLeads,
          avgLeadScore: Math.round(avgLeadScore[0]?.avg || 0),
        },
        recentLeads,
        leadsByIndustry,
        leadsByStatus,
      },
    });
  } catch (err) {
    logger.error('getDashboardMetrics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/calls
 * All booked consultations
 */
const getBookedCalls = async (req, res) => {
  try {
    const calls = await BookedCall.find({})
      .populate('client', 'name email companyName industry leadScore')
      .sort({ scheduledStartTime: 1 });

    res.json({ success: true, data: calls });
  } catch (err) {
    logger.error('getBookedCalls error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  addAdminNote,
  triggerFollowUp,
  exportLeadsCSV,
  getDashboardMetrics,
  getBookedCalls,
};
