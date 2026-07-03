import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import Auth from './components/Auth';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [description, setDescription] = useState('');
  const [income, setIncome] = useState('');
  const [food, setFood] = useState('');
  const [transport, setTransport] = useState('');
  const [entertainment, setEntertainment] = useState('');
  const [rent, setRent] = useState('');
  const [others, setOthers] = useState('');

  // 🔍 ለማጣሪያ የሚሆኑ ስቴቶች
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [totals, setTotals] = useState({ totalIncome: 0, totalExpenses: 0, netWealth: 0 });
  const [chartData, setChartData] = useState({
    labels: ['Food', 'Transport', 'Entertainment', 'Rent', 'Others'],
    datasets: [{ data: [0, 0, 0, 0, 0], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#64748b'] }]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTransactions(response.data);
      setFilteredTransactions(response.data);
      calculateCalculations(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) handleLogout();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn, fetchDashboardData]);

  // 🔍 የፍለጋ እና የማጣሪያ ስራ (Live Filter)
  useEffect(() => {
    let result = allTransactions;

    if (searchQuery) {
      result = result.filter(tx => 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(tx => tx.category === filterCategory);
    }

    setFilteredTransactions(result);
    calculateCalculations(result); // ማጣሪያው ሲደረግ የግራፍ ቁጥሮቹም አብረው ይለወጣሉ
  }, [searchQuery, filterCategory, allTransactions]);

  const calculateCalculations = (txs) => {
    let totalInc = 0;
    let totalExp = 0;
    let catTotals = { 'ምግብ (Food)': 0, 'ትራንስፖርት (Transport)': 0, 'መዝናኛ (Entertainment)': 0, 'ቤት ኪራይ (Rent)': 0, 'ሌሎች (Others)': 0 };

    txs.forEach(tx => {
      if (tx.amount > 0) {
        totalInc += tx.amount;
      } else {
        const absAmount = Math.abs(tx.amount);
        totalExp += absAmount;
        if (catTotals[tx.category] !== undefined) catTotals[tx.category] += absAmount;
        else catTotals['ሌሎች (Others)'] += absAmount;
      }
    });

    setTotals({ totalIncome: totalInc, totalExpenses: totalExp, netWealth: totalInc - totalExp });

    setChartData({
      labels: ['Food', 'Transport', 'Entertainment', 'Rent', 'Others'],
      datasets: [{
        data: [catTotals['ምግብ (Food)'], catTotals['ትራንስፖርት (Transport)'], catTotals['መዝናኛ (Entertainment)'], catTotals['ቤት ኪራይ (Rent)'], catTotals['ሌሎች (Others)']],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#64748b'],
        borderWidth: 1,
      }]
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!description) return alert("Please enter a description!");

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (income && Number(income) > 0) {
        await axios.post('http://localhost:5000/api/transactions', { description: `${description} - Income`, amount: Number(income), category: 'ገቢ' }, config);
      }

      const expensesList = [
        { val: food, cat: 'ምግብ (Food)' },
        { val: transport, cat: 'ትራንስፖርት (Transport)' },
        { val: entertainment, cat: 'መዝናኛ (Entertainment)' },
        { val: rent, cat: 'ቤት ኪራይ (Rent)' },
        { val: others, cat: 'ሌሎች (Others)' }
      ];

      for (const item of expensesList) {
        if (item.val && Number(item.val) > 0) {
          await axios.post('http://localhost:5000/api/transactions', { description: `${description} - ${item.cat.split(' ')[0]}`, amount: -Number(item.val), category: item.cat }, config);
        }
      }

      setDescription(''); setIncome(''); setFood(''); setTransport(''); setEntertainment(''); setRent(''); setOthers('');
      fetchDashboardData();
      alert("All transactions saved successfully!");
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  };

  const downloadStatement = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/reports/download-statement', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fintrack-statement.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => {
      setIsLoggedIn(true);
      setUser(JSON.parse(localStorage.getItem('user')));
    }} />;
  }

  return (
    <div className="dashboard-container">
      <div className="title-section" style={{ position: 'relative', width: '100%', maxWidth: '1100px' }}>
        <button onClick={handleLogout} style={{ position: 'absolute', right: 0, top: '10px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
        <h1>FINTRACK</h1>
        <p>Welcome, {user?.username}! Personal Finance Tracker</p>
      </div>

      <div className="layout-grid">
        {/* 📋 ፎርም ካርድ */}
        <div className="main-card">
          <h3 className="card-title">Monthly Transaction Entry</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="input-group">
              <label>Description / Month</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. June 2026 Budget" required />
            </div>
            <div className="input-group"><label style={{color: '#16a34a'}}>Total Income ($)</label><input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0" /></div>
            <div className="input-group"><label>Food Expenses ($)</label><input type="number" value={food} onChange={(e) => setFood(e.target.value)} placeholder="0" /></div>
            <div className="input-group"><label>Transport / Fuel ($)</label><input type="number" value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="0" /></div>
            <div className="input-group"><label>Entertainment ($)</label><input type="number" value={entertainment} onChange={(e) => setEntertainment(e.target.value)} placeholder="0" /></div>
            <div className="input-group"><label>House Rent ($)</label><input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="0" /></div>
           <div className="input-group"><label>Other Expenses ($)</label><input type="number" value={others} placeholder="0" onChange={(e) => setOthers(e.target.value)} /></div>
            <button type="submit" className="submit-btn">Save Transactions</button>
          </form>
          <button onClick={downloadStatement} className="download-btn">Download PDF Report</button>
        </div>

        {/* 📊 ዳሽቦርድ ካርድ (ከነ ማጣሪያው) */}
        <div className="main-card">
          <h3 className="card-title">Financial Summary</h3>
          
          {/* 🔍 የፍለጋ በይነገጽ */}
          <div className="filter-section">
            <div className="filter-group">
              <label>Search Description</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. June" />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="ገቢ">Income</option>
                <option value="ምግብ (Food)">Food</option>
                <option value="ትራንስፖርት (Transport)">Transport</option>
                <option value="መዝናኛ (Entertainment)">Entertainment</option>
                <option value="ቤት ኪራይ (Rent)">Rent</option>
                <option value="ሌሎች (Others)">Others</option>
              </select>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box income-box"><p className="stat-label">Income</p><p className="stat-value">${totals.totalIncome}</p></div>
            <div className="stat-box expense-box"><p className="stat-label">Expenses</p><p className="stat-value">${totals.totalExpenses}</p></div>
            <div className="stat-box wealth-box"><p className="stat-label">Net Wealth</p><p className="stat-value">${totals.netWealth}</p></div>
          </div>
          
          <div className="chart-wrapper">
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          {/* 📜 የተመዘገቡ መረጃዎች የቀጥታ ዝርዝር (History) */}
          <div className="transaction-list">
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#475569' }}>Transaction History ({filteredTransactions.length})</h4>
            {filteredTransactions.map((tx) => (
              <div key={tx._id} className="transaction-item">
                <div>
                  <div className="tx-desc">{tx.description}</div>
                  <div className="tx-cat">{tx.category}</div>
                </div>
                <div className={`tx-amount ${tx.amount > 0 ? 'income' : 'expense'}`}>
                  {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}