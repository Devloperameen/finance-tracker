const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const currencyRoutes = require('./routes/currencyRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ዳታቤዙን ማገናኘት
connectDB();

// ማስተናገጃዎች (Middlewares)
const allowedOrigins = [
  'http://localhost:3000',
  'https://finance-tracker-omega-smoky.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// 🔗 የኤፒአይ መንገዶችን ማገናኘት
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/currency', currencyRoutes); // 👈 ይህ መስመር የምንዛሬ አድራሻውን ይከፍታል
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('የFinTrack ባክኤንድ ሰርቨር ሙሉ በሙሉ ዝግጁ ነው!');
});

app.listen(PORT, () => {
  console.log(`ሰርቨሩ በፖርት ${PORT} ላይ ተነስቷል`);
});