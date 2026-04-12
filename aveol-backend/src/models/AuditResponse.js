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
    },
    budgetRange: {
      type: String,
    },
    automationGoals: {
      type: String,
      maxlength: [1000, 'Max 1000 characters'],
    },
    timeline: {
      type: String,
    },
    previousAutomationExperience: {
      type: String,
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
