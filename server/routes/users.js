const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  resetPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  validateUserUpdate,
  validateId,
  validateQuery
} = require('../utils/validators');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', validateQuery, getUsers);
router.get('/stats', getUserStats);
router.get('/:id', validateId, getUser);
router.put('/:id', validateId, validateUserUpdate, updateUser);
router.delete('/:id', validateId, deleteUser);
router.put('/:id/reset-password', validateId, resetPassword);

module.exports = router;
