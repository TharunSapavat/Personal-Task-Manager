const User = require('../models/UserModel');
const Task = require('../models/TaskModel');

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
    const user = await User.findById(userId).select('currentStreak longestStreak lastActiveDate');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let startDate, endDate;
    
    if (year) {
      // Specific year requested
      const yearNum = parseInt(year);
      startDate = new Date(Date.UTC(yearNum, 0, 1)); // Jan 1 of year (UTC)
      endDate = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59)); // Dec 31 of year (UTC)
    } else {
      // Default: last 365 days from today
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);
    }

    const completedTasks = await Task.find({
      userId,
      status: 'completed',
      completedAt: { $gte: startDate, $lte: endDate }
    }).select('completedAt').lean(); // Use lean() for better performance

    // Create activity map
    const activityMap = {};
    completedTasks.forEach(task => {
      const date = new Date(task.completedAt);
      // Use local date to match the date range generation
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
    });

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
    
    // Get current week stats
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tasksThisWeek = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: startOfWeek }
    });

    // Get current month stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const tasksThisMonth = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: startOfMonth }
    });

    const user = await User.findById(userId).select('currentStreak longestStreak points');

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
