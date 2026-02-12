// ==========================================
// KAYSAR: Task Controller  
// ==========================================

const Task = require('../models/Task');
const { sendTaskAssignmentEmail } = require('../config/email');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    
    let filter = { userId: req.user.id, isDeleted: false };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).populate('assignedTo', 'username email').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'username email');

    if (!task || task.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id
    });

    if (req.body.assignedTo && req.body.assignedTo !== req.user.id) {
      const User = require('../models/User');
      const assignedUser = await User.findById(req.body.assignedTo);
      if (assignedUser) {
        await sendTaskAssignmentEmail(
          assignedUser.email,
          assignedUser.username,
          task.title,
          req.user.username
        );
      }
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.isDeleted = true;
    await task.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// Search tasks
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const tasks = await Task.find({
      userId: req.user.id,
      isDeleted: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching tasks',
      error: error.message
    });
  }
};
