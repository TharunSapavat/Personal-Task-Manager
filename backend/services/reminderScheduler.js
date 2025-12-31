const cron = require('node-cron');
const User = require('../models/UserModel');
const Task = require('../models/TaskModel');
const { sendTaskReminder } = require('./emailService');

// Function to send reminders to all users with pending tasks
const sendRemindersToAllUsers = async (timeLabel) => {
  console.log(`Running daily reminder check at ${timeLabel}...`);
  
  try {
    // Get all users
    const users = await User.find().select('_id name email');
    
    for (const user of users) {
      // Get pending tasks for this user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pendingTasks = await Task.find({
        userId: user._id,
        status: { $in: ['pending', 'in-progress'] },
        $or: [
          { dueDate: { $lte: new Date() } }, // Overdue or due today
          { dueDate: null } // Tasks without due date
        ]
      }).select('title priority dueDate').limit(10);
      
      // Send reminder if user has pending tasks
      if (pendingTasks.length > 0) {
        await sendTaskReminder(user.email, user.name, pendingTasks);
        console.log(`Reminder sent to ${user.email} for ${pendingTasks.length} tasks`);
      }
    }
    
    console.log(`Daily reminder check at ${timeLabel} completed`);
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
};

// Schedule reminders at multiple times
const startReminderScheduler = () => {
  // Cron format: minute hour day month weekday
  
 
  cron.schedule('0 15 * * *', async () => {
    await sendRemindersToAllUsers('3 PM');
  });
   
  cron.schedule('0 20 * * *', async () => {
    await sendRemindersToAllUsers('8 PM');
  });
  
  console.log('📧 Email reminder scheduler started - Reminders will be sent at 3 PM and 8 PM daily');
};

module.exports = { startReminderScheduler };
