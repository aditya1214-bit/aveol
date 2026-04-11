const express = require('express');
const router = express.Router();
const { handleCalendlyWebhook } = require('../controllers/webhookController');

// Raw body is needed for signature verification — handled in server.js
router.post('/calendly', handleCalendlyWebhook);

module.exports = router;
