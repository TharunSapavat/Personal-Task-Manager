const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // Identity
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // VERY IMPORTANT
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Time & Locale
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    locale: {
      type: String,
      default: "en-IN",
    },

    // Gamification
    points: {
      type: Number,
      default: 0,
    },

    // Streak data
    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastActiveDate: {
      type: Date,
    },

    // Preferences
    preferences: {
      dailyReminder: {
        type: Boolean,
        default: false,
      },
      reminderTime: {
        type: String,
        default: "20:00",
      },
      quoteCategory: {
        type: String,
        default: "discipline",
      },
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);
 
 

 
UserSchema.index({ email: 1 }, { unique: true });

 

module.exports = mongoose.model("User", UserSchema);
