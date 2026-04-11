const Client = require('../models/Client');
const { sendFollowUp1Email, sendFollowUp2Email } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Scheduled job: send follow-up emails automatically
 * Run this every hour via setInterval or a cron scheduler
 *
 * Follow-up 1: 3 days after report sent, if no call booked
 * Follow-up 2: 7 days after report sent, if still no call booked
 */
const processFollowUps = async () => {
  const now = new Date();

  try {
    // ── Follow-up 1: 3 days after report sent ──────────────────
    const followUp1Cutoff = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const followUp1Leads = await Client.find({
      status: 'report_sent',
      reportSentAt: { $lte: followUp1Cutoff },
      followUp1SentAt: { $exists: false },
      unsubscribed: false,
      isSpam: false,
    }).limit(50);

    for (const client of followUp1Leads) {
      try {
        await sendFollowUp1Email(client);
        await Client.findByIdAndUpdate(client._id, {
          followUp1SentAt: new Date(),
          status: 'follow_up_1',
        });
        logger.info(`Follow-up 1 sent to ${client.email}`);
      } catch (err) {
        logger.error(`Follow-up 1 failed for ${client.email}:`, err.message);
      }
    }

    // ── Follow-up 2: 7 days after report sent ──────────────────
    const followUp2Cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const followUp2Leads = await Client.find({
      status: 'follow_up_1',
      reportSentAt: { $lte: followUp2Cutoff },
      followUp1SentAt: { $exists: true },
      followUp2SentAt: { $exists: false },
      unsubscribed: false,
      isSpam: false,
    }).limit(50);

    for (const client of followUp2Leads) {
      try {
        await sendFollowUp2Email(client);
        await Client.findByIdAndUpdate(client._id, {
          followUp2SentAt: new Date(),
          status: 'follow_up_2',
        });
        logger.info(`Follow-up 2 sent to ${client.email}`);
      } catch (err) {
        logger.error(`Follow-up 2 failed for ${client.email}:`, err.message);
      }
    }

    if (followUp1Leads.length + followUp2Leads.length > 0) {
      logger.info(`Follow-up job: sent ${followUp1Leads.length} FU1, ${followUp2Leads.length} FU2`);
    }

  } catch (err) {
    logger.error('processFollowUps job error:', err);
  }
};

/**
 * Start the follow-up scheduler
 * Runs every hour
 */
const startFollowUpScheduler = () => {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  logger.info('Follow-up email scheduler started (1hr interval)');
  setInterval(processFollowUps, INTERVAL_MS);
  // Run once on startup too
  setTimeout(processFollowUps, 10000); // 10s delay after server start
};

module.exports = { startFollowUpScheduler, processFollowUps };
