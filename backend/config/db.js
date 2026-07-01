const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ለአሁኑ በኮምፒውተርህ ላይ የሚሰራውን Local MongoDB እንጠቀማለን
    const conn = await mongoose.connect('mongodb://localhost:27017/fintrack');
    console.log(`MongoDB ተገናኝቷል: ${conn.connection.host}`);
  } catch (error) {
    console.error(`ስህተት: ${error.message}`);
    process.exit(1); // ከተበላሸ ሰርቨሩ እንዲቆም ያደርጋል
  }
};

module.exports = connectDB;