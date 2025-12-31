const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getTasks,
  getTodayTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.get('/stats', getTaskStats);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
