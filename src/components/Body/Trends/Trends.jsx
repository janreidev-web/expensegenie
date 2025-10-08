import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useTrendsData } from './useTrendsData';

// Register all necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// A reusable KPI Card component
const KpiCard = ({ title, value, colorClass = 'text-slate-800' }) => (
  <div className="bg-slate-50 p-4 rounded-lg text-center flex-1">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className={`text-2xl font-bold mt-1 ${colorClass}`}>
      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)}
    </p>
  </div>
);

const Trends = () => {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]); // NEW: State for income
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch both expenses and income in parallel
        const [expenseRes, incomeRes] = await Promise.all([
          fetch("/api/expenses/display-expense", { headers: { Authorization: `Bearer ${token}` } }),
          // NOTE: Assuming you have an API endpoint for fetching income.
          // If not, you can remove this and the related logic.
          fetch("/api/income/display-income", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const expenseData = await expenseRes.json();
        const incomeData = await incomeRes.json();

        if (!expenseRes.ok) throw new Error(expenseData.error || "Failed to fetch expenses");
        if (!incomeRes.ok) throw new Error(incomeData.error || "Failed to fetch income");
        
        setExpenses(expenseData.expenses || []);
        setIncome(incomeData.income || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { lineChartData, barChartData, kpiData, availableYears } = useTrendsData(expenses, income, selectedYear);

  if (loading) return <div className="text-center py-10">Loading Trends...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header and Year Filter */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Financial Trends</h3>
            <p className="text-gray-600">Analyze your income and spending patterns over time.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <label htmlFor="year-select" className="font-semibold text-sm">Select Year:</label>
             <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border rounded-md shadow-sm"
            >
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      {kpiData && (
        <section className="flex flex-wrap gap-4">
          <KpiCard title="Total Income" value={kpiData.totalIncome} colorClass="text-green-600" />
          <KpiCard title="Total Expenses" value={kpiData.totalExpenses} colorClass="text-red-600" />
          <KpiCard title="Net Savings" value={kpiData.netSavings} colorClass={kpiData.netSavings >= 0 ? 'text-blue-600' : 'text-orange-500'} />
          <KpiCard title="Avg. Monthly Expense" value={kpiData.avgMonthlyExpense} />
        </section>
      )}

      {/* Charts */}
      {lineChartData && barChartData ? (
        <>
        <section className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4 text-center">Income vs. Expenses ({selectedYear})</h4>
            <div className="h-96"><Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }}/></div>
        </section>
        <section className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4 text-center">Monthly Expense Breakdown ({selectedYear})</h4>
            <div className="h-96"><Bar data={barChartData} options={{ maintainAspectRatio: false, responsive: true, scales: { x: { stacked: true }, y: { stacked: true }} }}/></div>
        </section>
        </>
      ) : (
         <section className="text-center py-12 bg-white rounded-lg shadow">
            <h4 className="text-xl font-semibold">No data found for {selectedYear}.</h4>
            <p className="text-gray-500 mt-2">Try selecting another year or adding some income and expenses!</p>
        </section>
      )}
    </div>
  );
};

export default Trends;