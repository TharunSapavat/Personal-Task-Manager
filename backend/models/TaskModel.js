const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  points: {
    type: Number,
    default: 10
  },
  tags: [{
    type: String,
    trim: true
  }],
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, completedAt: -1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, status: 1, priority: -1 });

module.exports = mongoose.model('Task', TaskSchema);
