const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getDailyQuote, getAllQuotes } = require('../controllers/quoteController');

// All routes require authentication
router.use(authMiddleware);

router.get('/daily', getDailyQuote);
router.get('/all', getAllQuotes);

module.exports = router;
