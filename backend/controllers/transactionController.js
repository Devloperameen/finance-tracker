const Transaction = require('../models/Transaction');

// 1. ሁሉንም የገቢና ወጪ መረጃዎች ከዳታቤዝ ማምጣት
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }); // በአዲሱ ቀን መደርደር
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'መረጃውን ማምጣት አልተቻለም', error: error.message });
  }
};

// 2. አዲስ የገቢ ወይም ወጪ መረጃ ወደ ዳታቤዝ መጨመር
exports.addTransaction = async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    
    const newTransaction = new Transaction({
      description,
      amount,
      category
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: 'መረጃውን መመዝገብ አልተቻለም', error: error.message });
  }
};