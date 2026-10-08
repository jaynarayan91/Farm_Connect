const express = require('express');
const { addFeedback, getFeedbackByItem, getMyFeedbacks, getAllFeedbacks } = require('../controllers/feedBackController');
const { validateToken } = require('../authUtils');

const router = express.Router();

router.post('/feedback/addFeedback', validateToken, addFeedback);
router.get('/feedback/item/:itemName', validateToken, getFeedbackByItem);
router.get('/feedback/my', validateToken, getMyFeedbacks);
router.get('/feedback/all', validateToken, getAllFeedbacks);

module.exports = router;
