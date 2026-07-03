const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const currencyRoutes = require('./routes/currencyRoutes.js'); // 👈 አዲሱን የምንዛሬ ራውት እዚህ እንጠራዋለን

const app = express();
const PORT = 5000;

// ዳታቤዙን ማገናኘት
connectDB();

// ማስተናገጃዎች (Middlewares)
app.use(cors());
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