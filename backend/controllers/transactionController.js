const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// 1. ሁሉንም የገቢና ወጪ መረጃዎች ከዳታቤዝ ማምጣት (ለተጠቃሚው ብቻ)
exports.getTransactions = [authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'መረጃውን ማምጣት አልተቻለም', error: error.message });
  }
}];

// 2. አዲስ የገቢ ወይም ወጪ መረጃ ወደ ዳታቤዝ መጨመር
exports.addTransaction = [authMiddleware, async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    
    const newTransaction = new Transaction({
      userId: req.user.userId,
      description,
      amount,
      category
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: 'መረጃውን መመዝገብ አልተቻለም', error: error.message });
  }
}];