// ==========================================
// SULTAN: RoleCheck Middleware
// ==========================================

// Middleware for user role verification

/**
 * Checks if user has required role
 * @param {Array} allowedRoles - array of allowed roles ['admin', 'premium', 'user']
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // req.user is set in auth.js middleware (Participant 1)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';

      // Check if user's role is in allowed roles list
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verifying access rights',
        error: error.message
      });
    }
  };
};

/**
 * Checks if user is an administrator
 */
const isAdmin = (req, res, next) => {
  return roleCheck('admin')(req, res, next);
};

/**
 * Checks if user is premium or admin
 */
const isPremiumOrAdmin = (req, res, next) => {
  return roleCheck('admin', 'premium')(req, res, next);
};

/**
 * Middleware to check task limits for regular users
 */
const checkTaskLimit = async (req, res, next) => {
  try {
    const userRole = req.user.role || 'user';

    // Admin and premium have no limits
    if (userRole === 'admin' || userRole === 'premium') {
      return next();
    }

    // For regular users check limit (20 tasks)
    const Task = require('../models/Task'); // Will be created by Participant 2
    const taskCount = await Task.countDocuments({ 
      userId: req.user.id,
      isDeleted: false // Don't count deleted tasks
    });

    if (taskCount >= 20) {
      return res.status(403).json({
        success: false,
        message: 'Task limit reached for regular user (20). Upgrade to Premium for unlimited tasks.',
        currentCount: taskCount,
        limit: 20
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking task limit',
      error: error.message
    });
  }
};

module.exports = {
  roleCheck,
  isAdmin,
  isPremiumOrAdmin,
  checkTaskLimit
};
