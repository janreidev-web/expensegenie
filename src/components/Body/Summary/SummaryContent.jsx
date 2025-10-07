import { useEffect, useState, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const SummaryContent = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch expenses");
        }

        setExpenses(data.expenses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const { pieData, barData, insights } = useMemo(() => {
    if (expenses.length === 0) return {};

    const parsed = expenses.map((e) => {
      const dateStr =
        typeof e.date === "string" ? e.date : new Date(e.date).toISOString();
      return {
        ...e,
        date: dateStr,
        month: dateStr.slice(0, 7),
      };
    });

    const latestMonth = parsed
      .reduce((latest, item) => (item.date > latest ? item.date : latest), parsed[0].date)
      .slice(0, 7);

    const latestExpenses = parsed.filter((e) => e.month === latestMonth);
    const categoryTotals = {};
    latestExpenses.forEach(({ category, amount }) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    const pieLabels = Object.keys(categoryTotals);
    const pieAmounts = Object.values(categoryTotals);
    const pieData = {
      labels: pieLabels,
      datasets: [
        {
          data: pieAmounts,
          backgroundColor: [
            "#60A5FA",
            "#F87171",
            "#34D399",
            "#FBBF24",
            "#A78BFA",
            "#F472B6",
            "#FCD34D",
          ],
        },
      ],
    };

    const monthlyCategory = {};
    parsed.forEach(({ category, amount, month }) => {
      const key = `${month}-${category}`;
      monthlyCategory[key] = (monthlyCategory[key] || 0) + amount;
    });

    const barMonths = [...new Set(parsed.map((e) => e.month))].sort();
    const categorySet = [...new Set(parsed.map((e) => e.category))];

    const barData = {
      labels: barMonths,
      datasets: categorySet.map((cat, i) => ({
        label: cat,
        data: barMonths.map((month) => monthlyCategory[`${month}-${cat}`] || 0),
        backgroundColor: `hsl(${(i * 50) % 360}, 70%, 60%)`,
      })),
    };

    const topCategory = pieLabels[pieAmounts.indexOf(Math.max(...pieAmounts))];
    const totalPerMonth = {};
    parsed.forEach(({ month, amount }) => {
      totalPerMonth[month] = (totalPerMonth[month] || 0) + amount;
    });

    const sortedMonths = Object.keys(totalPerMonth).sort();
    const latestTotal = totalPerMonth[sortedMonths.at(-1)];
    const prevTotal = totalPerMonth[sortedMonths.at(-2)] || 0;

    const trend =
      latestTotal > prevTotal
        ? `Increased 📈 by ₱${(latestTotal - prevTotal).toFixed(2)}`
        : latestTotal < prevTotal
        ? `Decreased 📉 by ₱${(prevTotal - latestTotal).toFixed(2)}`
        : "No change in spending";

    return {
      pieData,
      barData,
      insights: {
        topCategory,
        topAmount: categoryTotals[topCategory],
        highestMonth: sortedMonths.at(-1),
        highestAmount: latestTotal,
        trend,
      },
    };
  }, [expenses]);

  if (loading) {
    return <div className="text-center py-10 text-lg">Loading charts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-8 p-4 bg-gray-50">
      {/* Chart Row */}
      <div className="w-full flex flex-col md:flex-row justify-center items-start gap-8 max-w-6xl">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-center mb-2">Pie Chart</h2>
          <div className="w-80 h-80">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-center mb-2">Bar Chart</h2>
          <div className="w-full h-80">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="w-full max-w-4xl mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Insights Summary</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-base leading-relaxed">
          <li>
            <strong>Most spent category (latest month):</strong>{" "}
            {insights.topCategory} (₱{insights.topAmount.toFixed(2)})
          </li>
          <li>
            <strong>Month with highest spending:</strong> {insights.highestMonth} (₱
            {insights.highestAmount.toFixed(2)})
          </li>
          <li>
            <strong>Spending trend:</strong> {insights.trend}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SummaryContent;
