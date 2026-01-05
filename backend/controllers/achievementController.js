const User = require('../models/UserModel');
const Task = require('../models/TaskModel');
const { achievements, profileLevels } = require('../config/achievements');

// Helper function to get task stats for user
async function getUserStats(userId) {
  const user = await User.findById(userId).select('activityHistory createdAt achievements achievementPoints');
  
  // Calculate total completed tasks
  const totalCompleted = user.activityHistory.reduce((sum, day) => sum + day.tasksCompleted, 0);
  
  // Get all tasks to calculate priorities and timing
  const allTasks = await Task.find({ user: userId });
  const completedTasks = allTasks.filter(task => task.status === 'completed');
  
  // Priority counts
  const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
  const mediumPriorityCompleted = completedTasks.filter(t => t.priority === 'medium').length;
  const lowPriorityCompleted = completedTasks.filter(t => t.priority === 'low').length;
  
  // Timing stats
  let earlyBirdCount = 0;
  let nightOwlCount = 0;
  
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours();
      if (hour < 8) earlyBirdCount++;
      if (hour >= 22) nightOwlCount++;
    }
  });
  
  // Max tasks in a day
  const maxTasksInDay = Math.max(...user.activityHistory.map(d => d.tasksCompleted), 0);
  
  // Weekly stats
  const last7Days = user.activityHistory.slice(-7);
  const currentWeekTasks = last7Days.reduce((sum, day) => sum + day.tasksCompleted, 0);
  
  // Find max weekly tasks (check all rolling 7-day windows)
  let maxWeeklyTasks = 0;
  for (let i = 0; i <= user.activityHistory.length - 7; i++) {
    const weekSum = user.activityHistory.slice(i, i + 7).reduce((sum, day) => sum + day.tasksCompleted, 0);
    maxWeeklyTasks = Math.max(maxWeeklyTasks, weekSum);
  }
  
  // Perfect weeks (all 7 days have tasks)
  let perfectWeeks = 0;
  for (let i = 0; i <= user.activityHistory.length - 7; i++) {
    const week = user.activityHistory.slice(i, i + 7);
    if (week.every(day => day.tasksCompleted > 0)) perfectWeeks++;
  }
  
  // Check if weekly record was just broken
  const weeklyRecordBroken = currentWeekTasks >= maxWeeklyTasks && currentWeekTasks > 0;
  
  // Session stats (will be passed from controller that tracks session)
  const tasksCreatedInSession = 0; // This will be tracked separately
  
  return {
    totalCompleted,
    highPriorityCompleted,
    mediumPriorityCompleted,
    lowPriorityCompleted,
    earlyBirdCount,
    nightOwlCount,
    maxTasksInDay,
    maxWeeklyTasks,
    perfectWeeks,
    weeklyRecordBroken,
    tasksCreatedInSession
  };
}

// Check and award achievements
exports.checkAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('currentStreak longestStreak achievements achievementPoints profileLevel activityHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user stats
    const stats = await getUserStats(userId);
    
    const newlyUnlocked = [];
    const alreadyUnlockedIds = user.achievements.map(a => a.badgeId);
    
    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (alreadyUnlockedIds.includes(achievement.id)) continue;
      
      // Check condition
      let conditionMet = false;
      if (achievement.requiresStats) {
        conditionMet = achievement.condition(user, stats);
      } else {
        conditionMet = achievement.condition(user);
      }
      
      if (conditionMet) {
        // Award achievement
        user.achievements.push({
          badgeId: achievement.id,
          unlockedAt: new Date(),
          notified: false
        });
        
        // Add points
        user.achievementPoints += achievement.points;
        
        // Update profile level
        for (const [level, data] of Object.entries(profileLevels)) {
          if (user.achievementPoints >= data.minPoints && user.achievementPoints <= data.maxPoints) {
            user.profileLevel = level;
            break;
          }
        }
        
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date()
        });
      }
    }
    
    if (newlyUnlocked.length > 0) {
      await user.save();
    }
    
    res.json({
      newlyUnlocked,
      totalPoints: user.achievementPoints,
      profileLevel: user.profileLevel
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ message: 'Error checking achievements' });
  }
};

// Get all achievements (locked + unlocked)
exports.getAllAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('achievements achievementPoints profileLevel');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const unlockedIds = user.achievements.map(a => a.badgeId);
    
    // Format achievements with unlock status
    const formattedAchievements = achievements.map(achievement => {
      const userAchievement = user.achievements.find(a => a.badgeId === achievement.id);
      
      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
        notified: userAchievement?.notified || false
      };
    });
    
    res.json({
      achievements: formattedAchievements,
      totalPoints: user.achievementPoints,
      profileLevel: user.profileLevel,
      unlockedCount: unlockedIds.length,
      totalCount: achievements.length
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ message: 'Error getting achievements' });
  }
};

// Mark achievement notifications as seen
exports.markNotified = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { achievementIds } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Mark achievements as notified
    user.achievements.forEach(achievement => {
      if (achievementIds.includes(achievement.badgeId)) {
        achievement.notified = true;
      }
    });
    
    await user.save();
    
    res.json({ message: 'Achievements marked as notified' });
  } catch (error) {
    console.error('Error marking notifications:', error);
    res.status(500).json({ message: 'Error marking notifications' });
  }
};

// Get unnotified achievements
exports.getUnnotifiedAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('achievements');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const unnotified = user.achievements
      .filter(a => !a.notified)
      .map(a => {
        const achievementDef = achievements.find(def => def.id === a.badgeId);
        return {
          ...achievementDef,
          unlockedAt: a.unlockedAt
        };
      });
    
    res.json({ unnotified });
  } catch (error) {
    console.error('Error getting unnotified achievements:', error);
    res.status(500).json({ message: 'Error getting unnotified achievements' });
  }
};

// Get user profile stats
exports.getProfileStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('achievements achievementPoints profileLevel currentStreak longestStreak');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const stats = await getUserStats(userId);
    
    const profileLevelData = Object.entries(profileLevels).find(
      ([level]) => level === user.profileLevel
    );
    
    res.json({
      achievementPoints: user.achievementPoints,
      profileLevel: user.profileLevel,
      profileLevelData: profileLevelData ? { level: profileLevelData[0], ...profileLevelData[1] } : null,
      unlockedCount: user.achievements.length,
      totalAchievements: achievements.length,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalTasksCompleted: stats.totalCompleted
    });
  } catch (error) {
    console.error('Error getting profile stats:', error);
    res.status(500).json({ message: 'Error getting profile stats' });
  }
};
