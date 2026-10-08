const express = require('express');
const { addUser, getUserByEmailAndPassword, logout, forgotPassword, verifyOTPAndReset } = require('../controllers/userController.js');

const router = express.Router();

router.post('/users/signup', addUser);
router.post('/users/login', getUserByEmailAndPassword);
router.post('/users/logout', logout);
router.post('/users/forgot-password', forgotPassword);
router.post('/users/reset-password', verifyOTPAndReset);

module.exports = router;