// Achievement Definitions
const achievements = [
  // Streak Achievements
  {
    id: 'first_day',
    name: 'Getting Started',
    description: 'Complete your first day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    points: 5,
    condition: (user) => user.currentStreak >= 1
  },
  {
    id: 'three_day_streak',
    name: 'Consistency',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    points: 10,
    condition: (user) => user.currentStreak >= 3
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    points: 25,
    condition: (user) => user.currentStreak >= 7
  },
  {
    id: 'fortnight_fighter',
    name: 'Fortnight Fighter',
    description: 'Complete 14-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    points: 50,
    condition: (user) => user.currentStreak >= 14
  },
  {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Complete 30-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'epic',
    points: 100,
    condition: (user) => user.currentStreak >= 30
  },
  {
    id: 'quarter_champion',
    name: 'Quarter Champion',
    description: 'Complete 90-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'epic',
    points: 200,
    condition: (user) => user.currentStreak >= 90
  },
  {
    id: 'legendary_streak',
    name: 'Legendary',
    description: 'Complete 365-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'legendary',
    points: 500,
    condition: (user) => user.currentStreak >= 365
  },
  {
    id: 'streak_record',
    name: 'Unstoppable',
    description: 'Break your longest streak record',
    icon: '💪',
    category: 'streak',
    rarity: 'epic',
    points: 100,
    condition: (user) => user.currentStreak > user.longestStreak - 1
  },

  // Task Volume Achievements
  {
    id: 'first_task',
    name: 'First Step',
    description: 'Complete your first task',
    icon: '✅',
    category: 'tasks',
    rarity: 'common',
    points: 5,
    requiresStats: true,
    condition: (user, stats) => stats.totalCompleted >= 1
  },
  {
    id: 'ten_tasks',
    name: 'Getting Things Done',
    description: 'Complete 10 tasks',
    icon: '✅',
    category: 'tasks',
    rarity: 'common',
    points: 10,
    requiresStats: true,
    condition: (user, stats) => stats.totalCompleted >= 10
  },
  {
    id: 'fifty_tasks',
    name: 'Half Century',
    description: 'Complete 50 tasks',
    icon: '✅',
    category: 'tasks',
    rarity: 'rare',
    points: 25,
    requiresStats: true,
    condition: (user, stats) => stats.totalCompleted >= 50
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 tasks',
    icon: '✅',
    category: 'tasks',
    rarity: 'rare',
    points: 50,
    requiresStats: true,
    condition: (user, stats) => stats.totalCompleted >= 100
  },
  {
    id: 'productivity_beast',
    name: 'Productivity Beast',
    description: 'Complete 500 tasks',
    icon: '✅',
    category: 'tasks',
    rarity: 'epic',
    points: 150,
    requiresStats: true,
    condition: (user, stats) => stats.totalCompleted >= 500
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete 1,000 tasks',
    icon: '✅',
    category: 'tasks',
    rarity: 'legendary',
    points: 300,
    requiresStats: true,
    condition: (user, stats) => stats.totalCompleted >= 1000
  },

  // Speed & Timing Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 tasks before 8 AM',
    icon: '⏰',
    category: 'timing',
    rarity: 'rare',
    points: 30,
    requiresStats: true,
    condition: (user, stats) => stats.earlyBirdCount >= 5
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 5 tasks after 10 PM',
    icon: '🌙',
    category: 'timing',
    rarity: 'rare',
    points: 30,
    requiresStats: true,
    condition: (user, stats) => stats.nightOwlCount >= 5
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 10 tasks in one day',
    icon: '⚡',
    category: 'timing',
    rarity: 'epic',
    points: 50,
    requiresStats: true,
    condition: (user, stats) => stats.maxTasksInDay >= 10
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all tasks for a week',
    icon: '🎯',
    category: 'timing',
    rarity: 'epic',
    points: 75,
    requiresStats: true,
    condition: (user, stats) => stats.perfectWeeks >= 1
  },

  // Priority Mastery
  {
    id: 'priority_pro',
    name: 'Priority Pro',
    description: 'Complete 50 high-priority tasks',
    icon: '🔴',
    category: 'priority',
    rarity: 'rare',
    points: 40,
    requiresStats: true,
    condition: (user, stats) => stats.highPriorityCompleted >= 50
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Complete 20 tasks of each priority',
    icon: '⚖️',
    category: 'priority',
    rarity: 'epic',
    points: 60,
    requiresStats: true,
    condition: (user, stats) => 
      stats.highPriorityCompleted >= 20 && 
      stats.mediumPriorityCompleted >= 20 && 
      stats.lowPriorityCompleted >= 20
  },

  // Weekly Performance
  {
    id: 'power_week',
    name: 'Power Week',
    description: 'Complete 20+ tasks in a week',
    icon: '💪',
    category: 'weekly',
    rarity: 'rare',
    points: 35,
    requiresStats: true,
    condition: (user, stats) => stats.maxWeeklyTasks >= 20
  },
  {
    id: 'personal_best',
    name: 'Personal Best',
    description: 'Set a new weekly record',
    icon: '🏅',
    category: 'weekly',
    rarity: 'epic',
    points: 50,
    requiresStats: true,
    condition: (user, stats) => stats.weeklyRecordBroken === true
  },

  // Special Achievements
  {
    id: 'fresh_start',
    name: 'Fresh Start',
    description: 'Welcome! Start your journey',
    icon: '🌅',
    category: 'special',
    rarity: 'common',
    points: 5,
    condition: (user) => true // Always awarded on first login
  },
  {
    id: 'organized',
    name: 'Organized',
    description: 'Create 10 tasks in one session',
    icon: '📝',
    category: 'special',
    rarity: 'common',
    points: 15,
    requiresStats: true,
    condition: (user, stats) => stats.tasksCreatedInSession >= 10
  },
  {
    id: 'point_milestone_1k',
    name: 'Point Master',
    description: 'Earn 1,000 points',
    icon: '💎',
    category: 'special',
    rarity: 'epic',
    points: 100,
    condition: (user) => user.points >= 1000
  }
];

// Category display info
const categories = {
  streak: { name: 'Streak', color: 'orange', icon: '🔥' },
  tasks: { name: 'Tasks', color: 'blue', icon: '✅' },
  timing: { name: 'Timing', color: 'purple', icon: '⏰' },
  priority: { name: 'Priority', color: 'red', icon: '🎯' },
  weekly: { name: 'Weekly', color: 'green', icon: '📊' },
  special: { name: 'Special', color: 'yellow', icon: '🌟' }
};

// Rarity levels
const rarityLevels = {
  common: { name: 'Common', color: 'gray', percentage: 70 },
  rare: { name: 'Rare', color: 'blue', percentage: 20 },
  epic: { name: 'Epic', color: 'purple', percentage: 8 },
  legendary: { name: 'Legendary', color: 'gold', percentage: 2 }
};

// Profile level thresholds
const profileLevels = {
  bronze: { minPoints: 0, maxPoints: 99, name: 'Bronze', icon: '🥉' },
  silver: { minPoints: 100, maxPoints: 499, name: 'Silver', icon: '🥈' },
  gold: { minPoints: 500, maxPoints: 999, name: 'Gold', icon: '🥇' },
  diamond: { minPoints: 1000, maxPoints: Infinity, name: 'Diamond', icon: '💎' }
};

module.exports = {
  achievements,
  categories,
  rarityLevels,
  profileLevels
};
