const express = require('express');
const { getInsights } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.get('/insights', getInsights);

module.exports = router;
