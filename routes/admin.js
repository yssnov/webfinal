// ==========================================
// SULTAN: Admin Routes
// ==========================================

// Admin роуты для управления пользователями и системой

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/roleCheck');
const auth = require('../middleware/auth'); // Создан Участником 1
const { adminLimiter } = require('../middleware/rateLimiter');

// Все admin роуты защищены auth + isAdmin middleware
// И имеют rate limiting

/**
 * @route   GET /api/admin/users
 * @desc    Получить всех пользователей
 * @access  Admin only
 */
router.get('/users', auth, isAdmin, adminLimiter, adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Получить конкретного пользователя
 * @access  Admin only
 */
router.get('/users/:id', auth, isAdmin, adminLimiter, adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Изменить роль пользователя (user/premium/admin)
 * @access  Admin only
 */
router.put('/users/:id/role', auth, isAdmin, adminLimiter, adminController.updateUserRole);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Удалить пользователя
 * @access  Admin only
 */
router.delete('/users/:id', auth, isAdmin, adminLimiter, adminController.deleteUser);

/**
 * @route   GET /api/admin/tasks
 * @desc    Получить все задачи всех пользователей
 * @access  Admin only
 */
router.get('/tasks', auth, isAdmin, adminLimiter, adminController.getAllTasks);

/**
 * @route   DELETE /api/admin/tasks/:id
 * @desc    Удалить любую задачу (даже не свою)
 * @access  Admin only
 */
router.delete('/tasks/:id', auth, isAdmin, adminLimiter, adminController.deleteAnyTask);

/**
 * @route   GET /api/admin/stats
 * @desc    Получить общую статистику системы
 * @access  Admin only
 */
router.get('/stats', auth, isAdmin, adminLimiter, adminController.getSystemStats);

module.exports = router;
