const mongoose = require('mongoose');

const auditResponseSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    // ── Step 1: Business Overview ──────────────────────────────
    currentTools: {
      type: [String],
      default: [],
    },
    otherTools: String,

    // ── Step 2: Pain Points ────────────────────────────────────
    biggestBottlenecks: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    repetitiveTasks: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    salesProblems: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    customerSupportProblems: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    leadGenIssues: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    crmIssues: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    operationsTasks: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },

    // ── Step 3: Scale & Budget ─────────────────────────────────
    monthlyBusinessVolume: {
      type: String,
      enum: [
        'Under ₹5L/month',
        '₹5L–₹20L/month',
        '₹20L–₹1Cr/month',
        '₹1Cr+/month',
        'Prefer not to say',
      ],
    },
    budgetRange: {
      type: String,
      enum: [
        'Under ₹25,000',
        '₹25,000–₹75,000',
        '₹75,000–₹2,00,000',
        '₹2,00,000+',
        'Depends on ROI',
      ],
    },
    automationGoals: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    timeline: {
      type: String,
      enum: [
        'Immediately',
        'Within 1 month',
        '1-3 months',
        '3+ months',
        'Just exploring for now',
        'ASAP',
        '1–3 months',
        '3–6 months',
        'Just exploring',
      ],
    },
    previousAutomationExperience: {
      type: String,
      enum: [
        'No, completely new to this',
        'Tried basic tools like Zapier',
        'Have some internal automations',
        'Worked with agencies before',
        'None',
        'Basic (Zapier/Make)',
        'Intermediate',
        'Advanced',
      ],
    },

    // ── AI Analysis Results ────────────────────────────────────
    aiAnalysis: {
      auditScore: { type: Number, min: 0, max: 100 },
      automationReadinessLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Very High'],
      },
      identifiedOpportunities: [
        {
          area: String,
          description: String,
          estimatedTimeSavedPerWeek: Number, // hours
          priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
        },
      ],
      recommendedAgents: [
        {
          agentName: String,
          agentType: String,
          description: String,
          estimatedROI: String,
          implementationTime: String,
        },
      ],
      estimatedAnnualSavings: {
        timeHours: Number,
        moneyINR: Number,
      },
      recommendedStack: [String],
      executiveSummary: String,
      fullReportText: String,
      quickWins: [String],
      longTermGoals: [String],
    },

    // ── Meta ───────────────────────────────────────────────────
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    analysisError: String,
    analysisCompletedAt: Date,
    reportPdfPath: String,
    submissionToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

auditResponseSchema.index({ client: 1 });
auditResponseSchema.index({ analysisStatus: 1 });
auditResponseSchema.index({ 'aiAnalysis.auditScore': -1 });

module.exports = mongoose.model('AuditResponse', auditResponseSchema);
