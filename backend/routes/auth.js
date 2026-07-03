const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || "fintrack_super_secret_key_123";

// 1. SIGNUP ROUTE (አዲስ ተጠቃሚ መመዝገቢያ)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ኢሜይሉ ከዚህ በፊት የተመዘገበ መሆኑን ማረጋገጥ
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "ይህ ኢሜይል አስቀድሞ ተመዝግቧል!" });
    }

    // የይለፍ ቃልን (Password) በምስጢር መቆለፍ (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // አዲሱን ተጠቃሚ በዳታቤዝ ውስጥ ማስቀመጥ
    user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: "ተጠቃሚው በተሳካ ሁኔታ ተመዝግቧል!" });

  } catch (error) {
    res.status(500).json({ message: "በምዝገባ ወቅት ስህተት አጋጥሟል", error: error.message });
  }
});

// 2. LOGIN ROUTE (መግቢያ)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ተጠቃሚውን በኢሜይል መፈለግ
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "የገቡት ኢሜይል ወይም ፓስወርድ የተሳሳተ ነው!" });
    }

    // ፓስወርዱን ማረጋገጥ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "የገቡት ኢሜይል ወይም ፓስወርድ የተሳሳተ ነው!" });
    }

    // ቶከን (JWT Token) መፍጠር - ለ 7 ቀን የሚቆይ
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: "በመግባት ወቅት ስህተት አጋጥሟል", error: error.message });
  }
});

module.exports = router;