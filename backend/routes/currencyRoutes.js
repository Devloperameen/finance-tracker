const express = require('express');
const router = express.Router();
const { getExchangeRates } = require('../controllers/currencyController');

// http://localhost:5000/api/currency ላይ GET ጥያቄዎችን መቀበል
router.get('/', getExchangeRates);

module.exports = router;