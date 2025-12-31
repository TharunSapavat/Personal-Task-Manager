const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getStreakData, getStreakStats } = require('../controllers/streakController');

router.use(authMiddleware);

router.get('/', getStreakData);
router.get('/stats', getStreakStats);

module.exports = router;
