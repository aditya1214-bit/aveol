// ── Override DNS to use Google (8.8.8.8) — fixes ISP-level SRV block for MongoDB Atlas ──
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startFollowUpScheduler } = require('./utils/followUpScheduler');

const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB then start server ──────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    // Start follow-up email scheduler
    startFollowUpScheduler();

    const server = app.listen(PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║         AVEOL BACKEND SERVER RUNNING         ║
╠══════════════════════════════════════════════╣
║  Port    : ${String(PORT).padEnd(34)}║
║  Env     : ${String(process.env.NODE_ENV || 'development').padEnd(34)}║
║  Health  : http://localhost:${String(PORT).padEnd(19)}/health ║
╚══════════════════════════════════════════════╝
      `);
    });

    // ── Graceful shutdown ─────────────────────────────────────────
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
