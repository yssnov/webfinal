// ==========================================
// KAYSAR: Dashboard Controller
// ==========================================

const Task = require('../models/Task');

// Get dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ userId, isDeleted: false });
    const completedTasks = await Task.countDocuments({ userId, status: 'completed', isDeleted: false });
    const todoTasks = await Task.countDocuments({ userId, status: 'todo', isDeleted: false });
    const inProgressTasks = await Task.countDocuments({ userId, status: 'in-progress', isDeleted: false });

    const highPriorityTasks = await Task.countDocuments({ userId, priority: 'high', isDeleted: false });

    const overdueTasks = await Task.countDocuments({
      userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
      isDeleted: false
    });

    const tasksByCategory = await Task.aggregate([
      { $match: { userId: req.user._id, isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: { userId: req.user._id, isDeleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
        highPriorityTasks,
        overdueTasks,
        tasksByCategory,
        tasksByPriority,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};
