import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useTrendsData } from './useTrendsData';
import KpiCard from './KpiCard'; // MODIFIED: Import the extracted component

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Trends = () => {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(''); // MODIFIED: Start with an empty string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // BEST PRACTICE: Use Promise.allSettled to handle individual API failures
        const results = await Promise.allSettled([
          fetch("/api/expenses/display-expense", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/income/display-income", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [expenseResult, incomeResult] = results;

        // Process expense data
        if (expenseResult.status === 'fulfilled') {
          const res = expenseResult.value;
          if (!res.ok) console.error("Failed to fetch expenses");
          else {
            const data = await res.json();
            setExpenses(data.expenses || []);
          }
        } else {
          console.error("Expense fetch failed:", expenseResult.reason);
        }
        
        // Process income data
        if (incomeResult.status === 'fulfilled') {
          const res = incomeResult.value;
          if (!res.ok) console.error("Failed to fetch income");
          else {
            const data = await res.json();
            setIncome(data.income || []);
          }
        } else {
           console.error("Income fetch failed:", incomeResult.reason);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { lineChartData, barChartData, kpiData, tableData, availableYears } = useTrendsData(expenses, income, selectedYear);
  
  // NEW: Automatically select the most recent year when data loads
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);


  if (loading) return <div className="text-center py-10">Loading Trends...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow">
        {/* Header and Year Filter remain the same */}
      </section>

      {kpiData && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* KPI Cards remain the same */}
        </section>
      )}

      {lineChartData && barChartData ? (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* --- NEW: Data Table Section --- */}
          <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Monthly Breakdown ({selectedYear})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2">Month</th>
                    <th className="p-2 text-right">Income</th>
                    <th className="p-2 text-right">Expenses</th>
                    <th className="p-2 text-right">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(({ month, income, expenses, net }) => (
                    <tr key={month} className="border-b border-slate-100">
                      <td className="p-2 font-semibold">{month}</td>
                      <td className="p-2 text-right text-green-600">{income.toFixed(0)}</td>
                      <td className="p-2 text-right text-red-600">{expenses.toFixed(0)}</td>

                      <td className={`p-2 text-right font-bold ${net >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>{net.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- MODIFIED: Chart now sits next to the table --- */}
          <div className="xl:col-span-3 bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4 text-center">Income vs. Expenses ({selectedYear})</h4>
            <div className="h-96"><Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }}/></div>
          </div>
        </div>
      ) : (
        <section className="text-center py-12 bg-white rounded-lg shadow">
            <h4 className="text-xl font-semibold">No data found for {selectedYear}.</h4>
            <p className="text-gray-500 mt-2">Try selecting another year or adding some income and expenses!</p>
        </section>
      )}
      
      {barChartData && (
         <section className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4 text-center">Monthly Expense Breakdown ({selectedYear})</h4>
            <div className="h-96"><Bar data={barChartData} options={{ maintainAspectRatio: false, responsive: true, scales: { x: { stacked: true }, y: { stacked: true }} }}/></div>
        </section>
      )}
    </div>
  );
};

export default Trends;