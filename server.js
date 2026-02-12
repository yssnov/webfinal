// ==========================================
// TASKMASTER API SERVER
// Team: Chingiz, Kaysar, Sultan
// ==========================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { startEmailSchedulers } = require('./utils/emailScheduler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for all API routes
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskMaster API is running',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// CHINGIZ: Authentication & User Management
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// ==========================================
// KAYSAR: Task Management & Features
// ==========================================
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ==========================================
// SULTAN: RBAC, Preferences & Admin
// ==========================================
app.use('/api/preferences', require('./routes/preferences'));
app.use('/api/admin', require('./routes/admin'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start email schedulers
startEmailSchedulers();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║      TaskMaster API Server Started       ║
╚═══════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📧 Email scheduler: Active
🛡️  Rate limiting: Enabled
⏰ Current time: ${new Date().toLocaleString()}

Team:
├── Chingiz: Authentication & Users
├── Kaysar: Tasks & Validation  
└── Sultan: RBAC & Email Service

Documentation: Check README.md
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
