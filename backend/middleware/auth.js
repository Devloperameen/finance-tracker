const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "fintrack_super_secret_key_123";

module.exports = function (req, res, next) {
  // ቶከኑን ከHeader ላይ መውሰድ
  const token = req.header('Authorization');

  // ቶከን ከሌለ መግባት አይቻልም
  if (!token) {
    return res.status(401).json({ message: "ቶከን አልተገኘም፣ ፍቃድ የለዎትም!" });
  }

  try {
    // ቶከኑ ትክክል መሆኑን ማረጋገጥ (Bearer የሚለውን ክፍል ለይቶ ለማውጣት)
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    
    // የተጠቃሚውን ID ወደ request ማጋራት
    req.user = decoded;
    next(); // ወደ ቀጣዩ ስራ ማለፍ
  } catch (error) {
    res.status(401).json({ message: "ቶከኑ ልክ አይደለም ወይም ጊዜው አልፏል!" });
  }
};