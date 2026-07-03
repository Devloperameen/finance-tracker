const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // 🌟 ከተጠቃሚው ጋር የሚያገናኘው መታወቂያ
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: { 
    type: String, 
    required: [true, 'እባክዎ መግለጫ ያስገቡ'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'እባክዎ የገንዘብ መጠን ያስገቡ'] 
  },
  category: { 
    type: String, 
    required: [true, 'እባክዎ ምድብ ይምረጡ'] 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);