import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";
import { useExpenseSummary } from "./useExpenseSummary"; // NEW: Import the custom hook

// ChartJS Registration (can stay here)
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// NEW: A reusable KPI Card component
const KpiCard = ({ title, value, isCurrency = false }) => (
  <div className="bg-white p-4 rounded-lg shadow text-center flex-1">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="text-2xl font-bold text-slate-800 mt-1">
      {isCurrency ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value) : value}
    </p>
  </div>
);

const Summary = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(''); // NEW: State for the selected month (e.g., '2025-10')

  // Data fetching logic remains similar
  useEffect(() => {
    const fetchExpenses = async () => {
      // ... your existing fetch logic ...
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/expenses/display-expense", { // Assuming this is the correct endpoint
             headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        setExpenses(data.expenses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);
  
  // NEW: Call the custom hook to get all calculated data
  const { pieData, barData, kpiData, availableMonths } = useExpenseSummary(expenses, selectedDate);

  // NEW: Set the initial selected date once data is available
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedDate) {
      setSelectedDate(availableMonths[0]);
    }
  }, [availableMonths, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Summary...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium">⚠️ Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- Header and Filters --- */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Expenses Summary</h3>
            <p className="text-gray-600">An overview of your spending habits.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <label htmlFor="month-select" className="font-semibold text-sm">Select Month:</label>
            <select
              id="month-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md shadow-sm"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* --- Main Content Area --- */}
      {kpiData ? (
        <>
          {/* KPI Cards */}
          <section className="flex flex-wrap gap-4">
            <KpiCard title="Total Spending" value={kpiData.totalSpending} isCurrency />
            <KpiCard title="Transactions" value={kpiData.transactionCount} />
            <KpiCard title="Top Category" value={kpiData.topCategory} />
            <KpiCard title="Spent on Top Category" value={kpiData.topCategoryAmount} isCurrency />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4 text-center">Category Breakdown</h4>
              <div className="h-80 mx-auto max-w-sm"><Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }} }}/></div>
            </div>
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4 text-center">Daily Spending</h4>
              <div className="h-80"><Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }} }}/></div>
            </div>
          </section>
        </>
      ) : (
        // Empty State
        <section className="text-center py-12 bg-white rounded-lg shadow">
          <h4 className="text-xl font-semibold">No expense data found for this period.</h4>
          <p className="text-gray-500 mt-2">Try selecting another month or adding some expenses!</p>
        </section>
      )}
    </div>
  );
};

export default Summary;