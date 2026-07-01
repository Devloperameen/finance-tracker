const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { generateMonthlyStatement } = require('../services/pdfService');

router.get('/download-statement', async (req, res) => {
  try {
    // 1. ሁሉንም መረጃዎች ከዳታቤዝ ማምጣት
    const transactions = await Transaction.find().sort({ date: -1 });

    // 2. ፒዲኤፉን ማመንጨት
    const pdfBuffer = await generateMonthlyStatement(transactions);

    // 3. ብሮውዘሩ ፋይሉን እንደ PDF እንዲያወርደው ሄደሮችን (Headers) ማስተካከል
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=fintrack-statement.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'ፒዲኤፍ ማዘጋጀት አልተቻለም', error: error.message });
  }
});

module.exports = router;