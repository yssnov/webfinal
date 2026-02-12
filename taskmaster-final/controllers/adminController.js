// ==========================================
// SULTAN: admin Controller
// ==========================================

// Контроллер для admin функционала

const User = require('../models/User'); // Создан Участником 1
const Task = require('../models/Task'); // Создан Участником 2
const { sendRoleUpgradeEmail } = require('../config/email');

/**
 * Получить всех пользователей
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    // Фильтры
    let filter = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password') // Не возвращаем пароли
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Получить пользователя по ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Получаем статистику задач пользователя
    const taskStats = await Task.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user,
        taskStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Изменить роль пользователя
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Валидация роли
    const validRoles = ['user', 'premium', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${validRoles.join(', ')}`
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Нельзя изменить роль самому себе
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Отправляем email уведомление о повышении роли
    if ((role === 'premium' || role === 'admin') && oldRole !== role) {
      await sendRoleUpgradeEmail(user.email, user.username, role);
    }

    res.json({
      success: true,
      message: `User role for ${user.username} changed from ${oldRole} на ${role}`,
      data: {
        userId: user._id,
        username: user.username,
        oldRole,
        newRole: role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing role',
      error: error.message
    });
  }
};

/**
 * Удалить пользователя
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Нельзя удалить самого себя
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account through admin panel'
      });
    }

    // Удаляем все задачи пользователя
    const deletedTasks = await Task.deleteMany({ userId: user._id });

    // Удаляем пользователя
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Пользователь ${user.username} and.*tasks deleted`,
      data: {
        deletedUser: user.username,
        deletedTasksCount: deletedTasks.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

/**
 * Получить все задачи всех пользователей
 */
exports.getAllTasks = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, priority, userId } = req.query;

    // Фильтры
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (userId) filter.userId = userId;

    const tasks = await Task.find(filter)
      .populate('userId', 'username email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

/**
 * Удалить любую задачу (admin привилегия)
 */
exports.deleteAnyTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Задача "${task.title}" deleted by administrator`,
      data: {
        deletedTask: task.title,
        taskId: task._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

/**
 * Получить общую статистику системы
 */
exports.getSystemStats = async (req, res) => {
  try {
    // Общее количество пользователей
    const totalUsers = await User.countDocuments();

    // Пользователи по ролям
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Общее количество задач
    const totalTasks = await Task.countDocuments();

    // Задачи по статусам
    const tasksByStatus = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Задачи по приоритетам
    const tasksByPriority = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Топ-5 самых активных пользователей
    const topUsers = await Task.aggregate([
      {
        $group: {
          _id: '$userId',
          taskCount: { $sum: 1 }
        }
      },
      { $sort: { taskCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          email: '$user.email',
          taskCount: 1
        }
      }
    ]);

    // Задачи созданные за последние 7 дней
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentTasks = await Task.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Новые пользователи за последние 7 дней
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          recentRegistrations: recentUsers
        },
        tasks: {
          total: totalTasks,
          byStatus: tasksByStatus,
          byPriority: tasksByPriority,
          recentlyCreated: recentTasks
        },
        topUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
