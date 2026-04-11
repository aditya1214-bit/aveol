const express = require('express');
const router = express.Router();
const { submitAudit, getAuditStatus, joinWaitlist } = require('../controllers/auditController');
const { validateAuditSubmission, validateWaitlist } = require('../middleware/validation');
const { auditSubmitLimiter, waitlistLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/submit', auditSubmitLimiter, validateAuditSubmission, submitAudit);
router.get('/status/:token', getAuditStatus);
router.post('/waitlist', waitlistLimiter, validateWaitlist, joinWaitlist);

module.exports = router;
