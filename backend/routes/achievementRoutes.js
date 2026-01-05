const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const achievementController = require('../controllers/achievementController');

// All routes require authentication
router.use(authMiddleware);

// Check for new achievements
router.post('/check', achievementController.checkAchievements);

// Get all achievements (locked + unlocked)
router.get('/', achievementController.getAllAchievements);

// Get unnotified achievements
router.get('/unnotified', achievementController.getUnnotifiedAchievements);

// Mark achievements as notified
router.post('/mark-notified', achievementController.markNotified);

// Get profile stats
router.get('/profile-stats', achievementController.getProfileStats);

module.exports = router;
