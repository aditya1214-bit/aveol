const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── BookedCall Model ─────────────────────────────────────────────────────────
const bookedCallSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    auditResponse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditResponse',
    },

    // Calendly Data
    calendlyEventUri: { type: String, unique: true, sparse: true },
    calendlyInviteeUri: String,
    eventType: String,
    scheduledStartTime: Date,
    scheduledEndTime: Date,
    timezone: String,
    meetLink: String,
    cancelUrl: String,
    rescheduleUrl: String,

    // Status
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
      default: 'scheduled',
    },
    adminNotes: String,
    outcome: String,

    // Notification flags
    adminNotified: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookedCallSchema.index({ client: 1 });
bookedCallSchema.index({ scheduledStartTime: 1 });
bookedCallSchema.index({ status: 1 });


// ── Admin Model ──────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['superadmin', 'admin', 'viewer'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const BookedCall = mongoose.model('BookedCall', bookedCallSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { BookedCall, Admin };
