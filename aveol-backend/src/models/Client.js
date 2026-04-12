const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    industry: {
      type: String,
      required: true,
    },
    teamSize: {
      type: String,
    },
    companyRole: {
      type: String,
    },

    // ── Lead Management ─────────────────────────────────────────
    status: {
      type: String,
      default: 'new',
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    priority: {
      type: String,
      default: 'medium',
    },
    adminNotes: [
      {
        note: String,
        addedAt: { type: Date, default: Date.now },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      },
    ],
    tags: [String],

    // ── Source ──────────────────────────────────────────────────
    source: {
      type: String,
      default: 'website',
    },
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,

    // ── Spam / Honeypot ─────────────────────────────────────────
    isSpam: { type: Boolean, default: false },
    honeypotTriggered: { type: Boolean, default: false },
    ipAddress: String,
    userAgent: String,

    // ── Relationships ───────────────────────────────────────────
    auditResponse: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditResponse' },
    bookedCall: { type: mongoose.Schema.Types.ObjectId, ref: 'BookedCall' },

    // ── Email tracking ──────────────────────────────────────────
    reportSentAt: Date,
    followUp1SentAt: Date,
    followUp2SentAt: Date,
    unsubscribed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ industry: 1 });
clientSchema.index({ leadScore: -1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ priority: 1, leadScore: -1 });

// Virtual: days since submission
clientSchema.virtual('daysSinceSubmission').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Client', clientSchema);
