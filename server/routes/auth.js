const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../utils/validators');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.use(protect); // All routes below this require authentication

router.get('/me', getMe);
router.put('/profile', validateUserUpdate, updateProfile);
router.post('/logout', logout);
router.put('/change-password', changePassword);

module.exports = router;
