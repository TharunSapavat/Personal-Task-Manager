const cron = require('node-cron');
const Task = require('../models/TaskModel');
const { sendReminderEmail } = require('./emailService');

// Check and send custom reminders every minute
const startCustomReminderScheduler = () => {
  // Run every minute to check for custom reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      
      // Find tasks with reminders due in the last minute that haven't been sent
      const tasksWithReminders = await Task.find({
        reminderEnabled: true,
        reminderSent: false,
        status: { $ne: 'completed' },
        reminderTime: {
          $gte: oneMinuteAgo,
          $lte: now
        }
      }).populate('userId', 'email name');

      if (tasksWithReminders.length > 0) {
        console.log(`Found ${tasksWithReminders.length} custom reminders to send`);
        
        // Group by user
        const tasksByUser = {};
        tasksWithReminders.forEach(task => {
          const userId = task.userId._id.toString();
          if (!tasksByUser[userId]) {
            tasksByUser[userId] = {
              user: task.userId,
              tasks: []
            };
          }
          tasksByUser[userId].tasks.push(task);
        });

        // Send emails and mark as sent
        for (const userId in tasksByUser) {
          const { user, tasks } = tasksByUser[userId];
          
          try {
            await sendReminderEmail(user.email, user.name, tasks);
            
            // Mark reminders as sent
            const taskIds = tasks.map(t => t._id);
            await Task.updateMany(
              { _id: { $in: taskIds } },
              { $set: { reminderSent: true } }
            );
            
            console.log(`Sent custom reminder to ${user.email} for ${tasks.length} task(s)`);
          } catch (err) {
            console.error(`Failed to send custom reminder to ${user.email}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Custom reminder scheduler error:', err);
    }
  });

  console.log('Custom reminder scheduler started (runs every minute)');
};

module.exports = { startCustomReminderScheduler };