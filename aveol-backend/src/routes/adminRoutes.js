const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  addAdminNote,
  triggerFollowUp,
  exportLeadsCSV,
  getDashboardMetrics,
  getBookedCalls,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');
const { validateAdminLogin, validateAdminRegister } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Auth (public)
router.post('/register', authLimiter, validateAdminRegister, registerAdmin);
router.post('/login', authLimiter, validateAdminLogin, loginAdmin);

// All routes below require authentication
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboardMetrics);

// Leads
router.get('/leads', getAllLeads);
router.get('/leads/export/csv', requireRole('superadmin', 'admin'), exportLeadsCSV);
router.get('/leads/:id', getLeadById);
router.patch('/leads/:id/status', updateLeadStatus);
router.post('/leads/:id/notes', addAdminNote);
router.post('/leads/:id/followup', requireRole('superadmin', 'admin'), triggerFollowUp);

// Calls
router.get('/calls', getBookedCalls);

module.exports = router;
