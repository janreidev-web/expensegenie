import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon, ChartBarIcon, LightBulbIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const Trends = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3months'); // 3months, 6months, 1year
  
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/expenses/display-expense", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setExpenses(data.expenses || []);
        }
      } catch (err) {
        console.error("Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Calculate insights
  const calculateInsights = () => {
    if (expenses.length === 0) return null;

    const now = new Date();
    const months = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const startDate = new Date(now.setMonth(now.getMonth() - months));

    const recentExpenses = expenses.filter(e => new Date(e.date) >= startDate);
    
    // Monthly spending
    const monthlyData = {};
    recentExpenses.forEach(exp => {
      const month = exp.date.slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + exp.amount;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const monthlyValues = sortedMonths.map(m => monthlyData[m]);

    // Category breakdown
    const categoryData = {};
    recentExpenses.forEach(exp => {
      categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
    });

    // Calculate trends
    const totalSpent = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avgMonthly = totalSpent / months;
    
    // Month-over-month change
    const lastMonth = monthlyValues[monthlyValues.length - 1] || 0;
    const previousMonth = monthlyValues[monthlyValues.length - 2] || 0;
    const monthChange = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;

    // Top category
    const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];

    // Spending prediction for next month
    const avgLast3Months = monthlyValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const trend = monthChange > 0 ? 'increasing' : monthChange < 0 ? 'decreasing' : 'stable';

    return {
      totalSpent,
      avgMonthly,
      monthChange,
      topCategory,
      categoryData,
      monthlyData: { labels: sortedMonths, values: monthlyValues },
      prediction: avgLast3Months,
      trend,
      expenseCount: recentExpenses.length
    };
  };

  const insights = calculateInsights();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!insights || insights.expenseCount === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow">
        <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No Expense Data</h3>
        <p className="text-gray-500 mt-2">Start adding expenses to see your spending trends and insights!</p>
      </div>
    );
  }

  // Chart data
  const lineChartData = {
    labels: insights.monthlyData.labels.map(m => {
      const [year, month] = m.split('-');
      return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Monthly Spending',
        data: insights.monthlyData.values,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const doughnutData = {
    labels: Object.keys(insights.categoryData),
    datasets: [
      {
        data: Object.values(insights.categoryData),
        backgroundColor: [
          '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6366F1'
        ],
      }
    ]
  };

  // Generate insights
  const getInsightText = () => {
    const insights = [];
    
    if (insights.monthChange > 10) {
      insights.push(`Your spending increased by ${Math.abs(insights.monthChange).toFixed(1)}% last month`);
    } else if (insights.monthChange < -10) {
      insights.push(`Great! You reduced spending by ${Math.abs(insights.monthChange).toFixed(1)}% last month`);
    }

    if (insights.topCategory) {
      insights.push(`${insights.topCategory[0]} is your largest expense category`);
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Spending Trends & Insights</h2>
            <p className="text-gray-600 mt-1">Analyze your spending patterns and predictions</p>
          </div>
          <div className="flex gap-2">
            {['3months', '6months', '1year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '3months' ? '3M' : range === '6months' ? '6M' : '1Y'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Spent</p>
            <ArrowTrendingDownIcon className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">₱{insights.totalSpent.toLocaleString()}</p>
          <p className="text-sm text-blue-100 mt-2">Last {timeRange.replace('months', ' months').replace('1year', ' year')}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Avg Monthly</p>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">₱{insights.avgMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          <p className="text-sm text-purple-100 mt-2">Per month average</p>
        </div>

        <div className={`bg-gradient-to-br ${insights.monthChange >= 0 ? 'from-orange-500 to-orange-600' : 'from-green-500 to-green-600'} p-6 rounded-lg shadow text-white`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/90">Month Change</p>
            {insights.monthChange >= 0 ? <ArrowUpIcon className="w-6 h-6" /> : <ArrowDownIcon className="w-6 h-6" />}
          </div>
          <p className="text-3xl font-bold">{insights.monthChange >= 0 ? '+' : ''}{insights.monthChange.toFixed(1)}%</p>
          <p className="text-sm text-white/90 mt-2">vs previous month</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-100">Prediction</p>
            <ArrowTrendingUpIcon className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">₱{insights.prediction.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          <p className="text-sm text-indigo-100 mt-2">Expected next month</p>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <LightBulbIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-gray-800 mb-2">💡 Smart Insights</h3>
            <ul className="space-y-2">
              {insights.monthChange > 10 && (
                <li className="text-gray-700">
                  ⚠️ Your spending increased by <strong>{Math.abs(insights.monthChange).toFixed(1)}%</strong> last month. Consider reviewing your expenses.
                </li>
              )}
              {insights.monthChange < -10 && (
                <li className="text-gray-700">
                  🎉 Great job! You reduced spending by <strong>{Math.abs(insights.monthChange).toFixed(1)}%</strong> last month.
                </li>
              )}
              {insights.topCategory && (
                <li className="text-gray-700">
                  📊 <strong>{insights.topCategory[0]}</strong> is your largest expense category at ₱{insights.topCategory[1].toLocaleString()}.
                </li>
              )}
              {insights.trend === 'increasing' && (
                <li className="text-gray-700">
                  📈 Your spending trend is <strong className="text-orange-600">increasing</strong>. Set a budget to control expenses.
                </li>
              )}
              {insights.trend === 'decreasing' && (
                <li className="text-gray-700">
                  📉 Your spending trend is <strong className="text-green-600">decreasing</strong>. Keep up the good work!
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
          <div className="h-80">
            <Line 
              data={lineChartData} 
              options={{ 
                maintainAspectRatio: false, 
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }} 
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                maintainAspectRatio: false, 
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Top Categories Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(insights.categoryData)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{category}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">₱{amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {((amount / insights.totalSpent) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Trends;