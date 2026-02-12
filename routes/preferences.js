// ==========================================
// SULTAN: Preferences Routes
// ==========================================

// Роуты для настроек пользователя

const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const auth = require('../middleware/auth'); // Создан Участником 1

/**
 * @route   GET /api/preferences
 * @desc    Получить настройки пользователя
 * @access  Private
 */
router.get('/', auth, preferencesController.getPreferences);

/**
 * @route   PUT /api/preferences
 * @desc    Обновить настройки пользователя
 * @access  Private
 */
router.put('/', auth, preferencesController.updatePreferences);

/**
 * @route   POST /api/preferences/reset
 * @desc    Сбросить настройки к дефолтным
 * @access  Private
 */
router.post('/reset', auth, preferencesController.resetPreferences);

module.exports = router;
