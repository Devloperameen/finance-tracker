const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction } = require('../controllers/transactionController');

// http://localhost:5000/api/transactions ላይ GET እና POST ጥያቄዎችን መቀበል
router.route('/')
  .get(getTransactions)
  .post(addTransaction);

module.exports = router;