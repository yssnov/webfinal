// ==========================================
// KAYSAR: Comment Routes
// ==========================================

const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { validateComment } = require('../middleware/validate');

router.get('/:taskId', protect, getComments);
router.post('/:taskId', protect, validateComment, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
