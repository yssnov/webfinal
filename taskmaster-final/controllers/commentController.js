// ==========================================
// KAYSAR: Comment Controller
// ==========================================

const Comment = require('../models/Comment');
const Task = require('../models/Task');

// Get comments for a task
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = await Comment.create({
      taskId: req.params.taskId,
      author: req.user.id,
      text: req.body.text
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};
