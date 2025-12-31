const Task = require('../models/TaskModel');
const User = require('../models/UserModel');
const { updateStreak } = require('./streakController');

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    let query = { userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tasks' 
    });
  }
};

// Get today's tasks
exports.getTodayTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId,
      $or: [
        { dueDate: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Get today tasks error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch today tasks' 
    });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, priority, dueDate, tags, reminderEnabled, reminderTime } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const task = await Task.create({
      userId,
      title,
      description,
      priority,
      dueDate,
      tags,
      reminderEnabled: reminderEnabled || false,
      reminderTime: reminderEnabled && reminderTime ? new Date(reminderTime) : null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create task' 
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If marking as completed, add completedAt timestamp and award points
    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date();
      
      // Award points to user
      await User.findByIdAndUpdate(userId, {
        $inc: { points: task.points || 10 }
      });

      // Update streak
      await updateStreak(userId);
    }
    
    // If unmarking as completed, remove completedAt and deduct points
    if (updates.status !== 'completed' && task.status === 'completed') {
      updates.completedAt = null;
      
      // Deduct points from user
      await User.findByIdAndUpdate(userId, {
        $inc: { points: -(task.points || 10) }
      });
    }

    // Handle reminder updates
    if (updates.reminderEnabled === false) {
      updates.reminderTime = null;
      updates.reminderSent = false;
    } else if (updates.reminderEnabled && updates.reminderTime) {
      updates.reminderTime = new Date(updates.reminderTime);
      updates.reminderSent = false; // Reset sent status when reminder time changes
    }

    Object.assign(task, updates);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update task' 
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete task' 
    });
  }
};

// Get task statistics (optimized with aggregation)
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Use aggregation pipeline for better performance - single query instead of 5
    const stats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          weeklyCompleted: [
            {
              $match: {
                status: 'completed',
                completedAt: { $gte: oneWeekAgo }
              }
            },
            { $count: 'count' }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const statusMap = {};
    stats[0].statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTasks: stats[0].total[0]?.count || 0,
        completedTasks: statusMap['completed'] || 0,
        pendingTasks: statusMap['pending'] || 0,
        inProgressTasks: statusMap['in-progress'] || 0,
        weeklyCompleted: stats[0].weeklyCompleted[0]?.count || 0
      }
    });
  } catch (err) {
    console.error('Get task stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch task statistics' 
    });
  }
};
