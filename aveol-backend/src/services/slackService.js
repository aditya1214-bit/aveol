const axios = require('axios');
const logger = require('../utils/logger');

const sendSlackNotification = async (message) => {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
  } catch (err) {
    logger.error('Slack notification failed:', err.message);
    // Non-critical — don't throw
  }
};

const notifyNewLead = async (client, auditResponse) => {
  const score = auditResponse?.aiAnalysis?.auditScore || 0;
  const priority = client.priority?.toUpperCase() || 'MEDIUM';
  const emoji = client.priority === 'hot' ? '🔥🔥🔥' : client.priority === 'high' ? '⚡' : '📋';

  const message = `${emoji} *NEW LEAD — ${priority} PRIORITY*
━━━━━━━━━━━━━━━━━━━━━━
*Company:* ${client.companyName}
*Contact:* ${client.name} (${client.email})
*Industry:* ${client.industry} · Team: ${client.teamSize}
*Lead Score:* ${client.leadScore}/100
*Audit Score:* ${score}/100 · ${auditResponse?.aiAnalysis?.automationReadinessLevel || 'N/A'} Readiness
*Budget:* ${auditResponse?.budgetRange || 'Not specified'}
*Timeline:* ${auditResponse?.timeline || 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━`;

  await sendSlackNotification(message);
};

const notifyCallBooked = async (client, call) => {
  const message = `📅 *CONSULTATION BOOKED*
━━━━━━━━━━━━━━━━━━━━━━
*Client:* ${client.name} — ${client.companyName}
*Email:* ${client.email}
*Time:* ${call.scheduledStartTime ? new Date(call.scheduledStartTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'TBD'} IST
*Meet:* ${call.meetLink || 'Check Calendly'}
━━━━━━━━━━━━━━━━━━━━━━`;

  await sendSlackNotification(message);
};

module.exports = { sendSlackNotification, notifyNewLead, notifyCallBooked };
