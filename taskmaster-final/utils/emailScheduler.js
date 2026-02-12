// ==========================================
// SULTAN: Email Scheduler (Cron Jobs)
// ==========================================

// Scheduler for automatic email reminder sending

const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDeadlineReminderEmail, sendOverdueTaskEmail } = require('../config/email');

/**
 * Check tasks with approaching deadlines (tomorrow)
 * Runs every day at 9:00 AM
 */
const checkUpcomingDeadlines = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔍 Checking tasks with approaching deadlines...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all incomplete tasks with deadline tomorrow
    const upcomingTasks = await Task.find({
      status: { $ne: 'completed' },
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    }).populate('userId', 'username email preferences');

    console.log(`📧 Found ${upcomingTasks.length} tasks with deadline tomorrow`);

    // Send reminders
    for (const task of upcomingTasks) {
      // Check user preferences (if they disabled notifications)
      if (task.userId.preferences?.emailNotifications !== false) {
        await sendDeadlineReminderEmail(
          task.userId.email,
          task.userId.username,
          task.title,
          task.dueDate
        );
      }
    }

    console.log('✅ Deadline reminders sent');
  } catch (error) {
    console.error('❌ Error checking deadlines:', error);
  }
});

/**
 * Check overdue tasks
 * Runs every day at 10:00 AM
 */
const checkOverdueTasks = cron.schedule('0 10 * * *', async () => {
  try {
    console.log('🔍 Checking overdue tasks...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue tasks
    const overdueTasks = await Task.find({
      status: { $ne: 'completed' },
      dueDate: { $lt: today },
      overdueEmailSent: { $ne: true } // Haven't sent notification yet
    }).populate('userId', 'username email preferences');

    console.log(`📧 Found ${overdueTasks.length} overdue tasks`);

    // Send notifications
    for (const task of overdueTasks) {
      if (task.userId.preferences?.emailNotifications !== false) {
        const result = await sendOverdueTaskEmail(
          task.userId.email,
          task.userId.username,
          task.title,
          task.dueDate
        );

        // Mark that notification was sent
        if (result.success) {
          task.overdueEmailSent = true;
          await task.save();
        }
      }
    }

    console.log('✅ Overdue task notifications sent');
  } catch (error) {
    console.error('❌ Error checking overdue tasks:', error);
  }
});

/**
 * Start all schedulers
 */
const startEmailSchedulers = () => {
  console.log('📅 Starting email schedulers...');
  
  checkUpcomingDeadlines.start();
  console.log('✅ Deadline scheduler started (every day at 9:00 AM)');
  
  checkOverdueTasks.start();
  console.log('✅ Overdue tasks scheduler started (every day at 10:00 AM)');
};

/**
 * Stop all schedulers
 */
const stopEmailSchedulers = () => {
  checkUpcomingDeadlines.stop();
  checkOverdueTasks.stop();
  console.log('⏹️ Email schedulers stopped');
};

/**
 * Manual deadline check (for testing)
 */
const manualCheckDeadlines = async () => {
  try {
    console.log('🧪 Manual deadline check...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingTasks = await Task.find({
      status: { $ne: 'completed' },
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    }).populate('userId', 'username email');

    console.log(`Found ${upcomingTasks.length} tasks with deadline tomorrow:`);
    upcomingTasks.forEach(task => {
      console.log(`- ${task.title} (user: ${task.userId.username})`);
    });

    return upcomingTasks;
  } catch (error) {
    console.error('❌ Manual check error:', error);
    throw error;
  }
};

module.exports = {
  startEmailSchedulers,
  stopEmailSchedulers,
  manualCheckDeadlines
};
