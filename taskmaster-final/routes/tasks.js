// ==========================================
// KAYSAR: Task Routes
// ==========================================

const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  searchTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');

router.get('/search', protect, searchTasks);
router.get('/', protect, getAllTasks);
router.get('/:id', protect, getTask);
router.post('/', protect, validateTask, createTask);
router.put('/:id', protect, validateTask, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
