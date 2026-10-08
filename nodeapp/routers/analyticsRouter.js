// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getOwnerAnalytics } = require('../controllers/analyticsController');
const { getSupplierAnalytics } = require('../controllers/supplierAnalyticsController');
const { validateToken } = require('../authUtils'); // adjust path as needed

// GET /api/analytics/owner  — owner must be logged in
router.get('/owner', validateToken, getOwnerAnalytics);

router.get('/supplier', validateToken, getSupplierAnalytics);

module.exports = router;