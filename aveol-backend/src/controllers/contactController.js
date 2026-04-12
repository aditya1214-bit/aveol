const { Resend } = require('resend');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

const submitContact = async (req, res) => {
  try {
    const { name, email, business, message, _honey } = req.body;

    // Honeypot check for spam protection
    if (_honey) {
      logger.warn(`Honeypot triggered from IP: ${req.ip} on contact form.`);
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !business || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // 1. Save data to MongoDB
    const newContact = await Contact.create({
      name,
      email,
      business,
      message,
    });

    // 2. Respond to the user immediately (so email sending does not block UI)
    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
    });

    // 3. Send email asynchronously
    try {
      if (process.env.RESEND_API_KEY) {
        logger.info(`[EMAIL] Attempting to send to rajaditya81156@gmail.com via Resend`);
        await resend.emails.send({
          from: 'AVEOL Contact <notifications@resend.dev>',
          to: 'rajaditya81156@gmail.com',
          reply_to: email,
          subject: 'New Consultation Request — Aveol',
          html: `
            <h3>New Consultation Request</h3>
            <p>You have received a new consultation request from the website.</p>
            <table border="0" cellpadding="8" cellspacing="0">
              <tr>
                <td><strong>Name:</strong></td>
                <td>${name}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${email}</td>
              </tr>
              <tr>
                <td><strong>Business Type:</strong></td>
                <td>${business}</td>
              </tr>
              <tr>
                <td valign="top"><strong>Message:</strong></td>
                <td>${message.replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated notification from your website.</p>
          `
        });
        logger.info(`[EMAIL] ✅ Contact email sent successfully for ${email}`);
      } else {
        logger.warn(`[EMAIL] ❌ Skipped — RESEND_API_KEY not set`);
      }
    } catch (emailErr) {
      logger.error(`[EMAIL] ❌ FAILED — ${emailErr.message}`);
    }

  } catch (err) {
    logger.error('submitContact error:', err);
    // Only send the error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
};

module.exports = { submitContact };
