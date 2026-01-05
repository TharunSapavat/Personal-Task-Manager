const User = require('../models/UserModel');
const Task = require('../models/TaskModel');

// Fix completed tasks without completedAt timestamp
async function fixCompletedTasksTimestamps(userId) {
  try {
    // Find all completed tasks without completedAt
    const tasksToFix = await Task.find({
      userId,
      status: 'completed',
      completedAt: { $exists: false }
    });

    if (tasksToFix.length > 0) {
      console.log(`Fixing ${tasksToFix.length} completed tasks without completedAt timestamp`);
      
      // Update each task to set completedAt to updatedAt
      for (const task of tasksToFix) {
        task.completedAt = task.updatedAt || task.createdAt;
        await task.save();
      }
    }
  } catch (err) {
    console.error('Error fixing completed tasks timestamps:', err);
  }
}

// Update user streak based on task completion
exports.updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already active today, no change
        return user;
      } else if (daysDiff === 1) {
        // Consecutive day
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
      } else {
        // Streak broken
        user.currentStreak = 1;
      }
    } else {
      // First time
      user.currentStreak = 1;
      user.longestStreak = 1;
    }

    user.lastActiveDate = today;
    await user.save();
    return user;
  } catch (err) {
    console.error('Update streak error:', err);
    throw err;
  }
};

// Get user streak data
exports.getStreakData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year } = req.query; // Get year from query parameter
    const user = await User.findById(userId).select('currentStreak longestStreak lastActiveDate activityHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fix any completed tasks without completedAt timestamp
    await fixCompletedTasksTimestamps(userId);

    let startDate, endDate;
    
    if (year) {
      // Specific year requested
      const yearNum = parseInt(year);
      startDate = new Date(Date.UTC(yearNum, 0, 1)); // Jan 1 of year (UTC)
      endDate = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59)); // Dec 31 of year (UTC)
    } else {
      // Default: last 90 days from today (more reasonable than 365)
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999); // End of today
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 89); // 90 days total including today
      startDate.setHours(0, 0, 0, 0);
    }

    // Use persistent activity history from user model (survives task deletion)
    const activityMap = {};
    
    // First, get data from user's activity history
    if (user.activityHistory && user.activityHistory.length > 0) {
      console.log(`Found ${user.activityHistory.length} days in user's activity history`);
      user.activityHistory.forEach(activity => {
        activityMap[activity.date] = activity.tasksCompleted;
      });
    } else {
      console.log('No activity history found in user document');
    }
    
    // Also query current tasks as a fallback/supplement for migration
    const completedTasks = await Task.find({
      userId,
      status: 'completed',
      $or: [
        { completedAt: { $gte: startDate, $lte: endDate } },
        { completedAt: { $exists: false }, updatedAt: { $gte: startDate, $lte: endDate } }
      ]
    }).select('completedAt updatedAt createdAt').lean();

    console.log(`Found ${completedTasks.length} completed tasks in database`);

    // Merge task data with activity history (activity history takes precedence)
    completedTasks.forEach(task => {
      const completionDate = task.completedAt || task.updatedAt || task.createdAt;
      if (completionDate) {
        const date = new Date(completionDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        // Only use task data if activity history doesn't have this date
        if (!activityMap[dateKey]) {
          activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
        }
      }
    });

    console.log(`Activity map has ${Object.keys(activityMap).length} days with activity`);

    // Generate date range array
    const yearActivity = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      yearActivity.push({
        date: dateKey,
        tasksCompleted: activityMap[dateKey] || 0,
        level: activityMap[dateKey] >= 5 ? 4 : activityMap[dateKey] >= 3 ? 3 : activityMap[dateKey] >= 1 ? 2 : activityMap[dateKey] > 0 ? 1 : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      streak: {
        current: user.currentStreak || 0,
        longest: user.longestStreak || 0,
        lastActive: user.lastActiveDate
      },
      activityHistory: yearActivity
    });
  } catch (err) {
    console.error('Get streak data error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak data'
    });
  }
};

// Get streak statistics
exports.getStreakStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('currentStreak longestStreak points activityHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate this week's tasks from activity history
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let tasksThisWeek = 0;
    let tasksThisMonth = 0;

    // Use activity history for accurate counts (survives task deletion)
    if (user.activityHistory && user.activityHistory.length > 0) {
      user.activityHistory.forEach(activity => {
        const [year, month, day] = activity.date.split('-').map(Number);
        const activityDate = new Date(year, month - 1, day);
        
        if (activityDate >= startOfWeek) {
          tasksThisWeek += activity.tasksCompleted;
        }
        
        if (activityDate >= startOfMonth) {
          tasksThisMonth += activity.tasksCompleted;
        }
      });
    }

    // Also count current tasks as a fallback/supplement
    const currentWeekTasks = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: startOfWeek, $exists: true }
    });

    const currentMonthTasks = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: startOfMonth, $exists: true }
    });

    // Use the maximum of activity history and current tasks (for migration)
    tasksThisWeek = Math.max(tasksThisWeek, currentWeekTasks);
    tasksThisMonth = Math.max(tasksThisMonth, currentMonthTasks);

    res.status(200).json({
      success: true,
      stats: {
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        totalPoints: user.points || 0,
        tasksThisWeek,
        tasksThisMonth
      }
    });
  } catch (err) {
    console.error('Get streak stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak statistics'
    });
  }
};
