import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardChart() {
  const [chartData, setChartData] = useState(null);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpenses: 0, netWealth: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // ከባክኤንድ አግሪጌሽን የተሰራውን ዳታ መጥራት
        const response = await axios.get('/api/analytics/summary');
        const { totals, categories } = response.data;
        
        setTotals(totals);

        // ለChart.js በሚመች ፎርማት ሴት ማድረግ
        setChartData({
          labels: categories.map(c => c._id),
          datasets: [
            {
              label: 'ወጪዎች በየምድቡ',
              data: categories.map(c => c.totalSpent),
              backgroundColor: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("ዳታውን ማምጣት አልተቻለም:", error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-4">የፋይናንስ ሁኔታ መግለጫ</h3>
      
      {/* የገንዘብ ማጠቃለያ ካርዶች */}
      <div className="grid grid-cols-3 gap-2 text-center mb-6">
        <div className="bg-green-50 p-2 rounded-lg">
          <p className="text-xs text-green-700 font-medium">ጠቅላላ ገቢ</p>
          <p className="text-sm font-bold text-green-900">${totals.totalIncome}</p>
        </div>
        <div className="bg-red-50 p-2 rounded-lg">
          <p className="text-xs text-red-700 font-medium">ጠቅላላ ወጪ</p>
          <p className="text-sm font-bold text-red-900">${totals.totalExpenses}</p>
        </div>
        <div className="bg-indigo-50 p-2 rounded-lg">
          <p className="text-xs text-indigo-700 font-medium">የተጣራ ሀብት</p>
          <p className="text-sm font-bold text-indigo-900">${totals.netWealth}</p>
        </div>
      </div>

      {/* የግራፍ ማሳያ */}
      <div className="relative h-64 flex justify-center">
        {chartData ? (
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        ) : (
          <p className="text-sm text-gray-400 my-auto">በመጫን ላይ...</p>
        )}
      </div>
    </div>
  );
}