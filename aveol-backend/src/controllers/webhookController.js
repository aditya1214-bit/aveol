const crypto = require('crypto');
const Client = require('../models/Client');
const { BookedCall } = require('../models/BookedCall');
const { sendAdminNotification } = require('../services/emailService');
const { notifyCallBooked } = require('../services/slackService');
const logger = require('../utils/logger');

/**
 * POST /api/webhooks/calendly
 * Handles Calendly webhook events
 */
const handleCalendlyWebhook = async (req, res) => {
  try {
    // ── Verify Calendly signature ────────────────────────────────
    const signature = req.headers['calendly-webhook-signature'];
    if (!verifyCalendlySignature(req.rawBody || JSON.stringify(req.body), signature)) {
      logger.warn('Invalid Calendly webhook signature');
      return res.status(401).json({ success: false, message: 'Invalid signature.' });
    }

    const { event, payload } = req.body;
    logger.info(`Calendly webhook received: ${event}`);

    if (event === 'invitee.created') {
      await handleInviteeCreated(payload);
    } else if (event === 'invitee.canceled') {
      await handleInviteeCanceled(payload);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Calendly webhook error:', err);
    res.status(500).json({ success: false });
  }
};

const handleInviteeCreated = async (payload) => {
  const inviteeEmail = payload?.email?.toLowerCase();
  const inviteeName = payload?.name;

  if (!inviteeEmail) {
    logger.warn('Calendly webhook: no invitee email');
    return;
  }

  // ── Find or create client ────────────────────────────────────
  let client = await Client.findOne({ email: inviteeEmail });

  if (!client) {
    client = await Client.create({
      name: inviteeName || 'Calendly Booking',
      email: inviteeEmail,
      companyName: payload?.questions_and_answers?.find(q => q.question?.toLowerCase().includes('company'))?.answer || 'Unknown',
      industry: 'Other',
      source: 'website',
      status: 'consultation_booked',
    });
    logger.info(`New client created from Calendly: ${inviteeEmail}`);
  } else {
    await Client.findByIdAndUpdate(client._id, { status: 'consultation_booked' });
  }

  // ── Create/update booked call record ────────────────────────
  const existingCall = await BookedCall.findOne({ calendlyEventUri: payload?.event });

  if (!existingCall) {
    const call = await BookedCall.create({
      client: client._id,
      auditResponse: client.auditResponse,
      calendlyEventUri: payload?.event,
      calendlyInviteeUri: payload?.uri,
      eventType: payload?.event_type?.name || 'Strategy Call',
      scheduledStartTime: payload?.scheduled_event?.start_time,
      scheduledEndTime: payload?.scheduled_event?.end_time,
      timezone: payload?.timezone,
      meetLink: payload?.scheduled_event?.location?.join_url,
      cancelUrl: payload?.cancel_url,
      rescheduleUrl: payload?.reschedule_url,
      status: 'scheduled',
      adminNotified: false,
    });

    // Link to client
    await Client.findByIdAndUpdate(client._id, { bookedCall: call._id });

    // ── Notifications ─────────────────────────────────────────
    await sendAdminNotification(client, null, 'call_booked');
    await notifyCallBooked(client, call);

    logger.info(`Consultation booked: ${inviteeEmail} at ${call.scheduledStartTime}`);
  }
};

const handleInviteeCanceled = async (payload) => {
  const call = await BookedCall.findOne({ calendlyEventUri: payload?.event });
  if (call) {
    call.status = 'cancelled';
    await call.save();

    await Client.findByIdAndUpdate(call.client, { status: 'new' });
    logger.info(`Call cancelled: ${payload?.event}`);
  }
};

// ── Signature verification ────────────────────────────────────────────────────
const verifyCalendlySignature = (rawBody, signature) => {
  if (!process.env.CALENDLY_WEBHOOK_SECRET) {
    logger.warn('CALENDLY_WEBHOOK_SECRET not set — skipping signature verification');
    return true; // Allow in development
  }

  if (!signature) return false;

  try {
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const v1Sig = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !v1Sig) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.CALENDLY_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(v1Sig));
  } catch {
    return false;
  }
};

module.exports = { handleCalendlyWebhook };
