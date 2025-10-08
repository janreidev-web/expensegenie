import { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const useTrendsData = (expenses = [], income = [], selectedYear) => {
  return useMemo(() => {
    if (!selectedYear) {
      return { lineChartData: null, barChartData: null, kpiData: null, availableYears: [] };
    }

    // --- Data Preparation ---
    const getYear = (dateStr) => dateStr.slice(0, 4);
    const getMonth = (dateStr) => parseInt(dateStr.slice(5, 7), 10) - 1; // 0-indexed

    const availableYears = [
      ...new Set([...expenses.map(e => getYear(e.date)), ...income.map(i => getYear(i.date))])
    ].sort((a, b) => b - a);

    const filteredExpenses = expenses.filter(e => getYear(e.date) === selectedYear);
    const filteredIncome = income.filter(i => getYear(i.date) === selectedYear);

    // --- Process Monthly Totals for Line Chart and KPIs ---
    const monthlyExpenses = Array(12).fill(0);
    const monthlyIncome = Array(12).fill(0);

    filteredExpenses.forEach(({ date, amount }) => {
      monthlyExpenses[getMonth(date)] += amount;
    });
    filteredIncome.forEach(({ date, amount }) => {
      monthlyIncome[getMonth(date)] += amount;
    });

    const lineChartData = {
      labels: MONTHS,
      datasets: [
        {
          label: 'Income',
          data: monthlyIncome,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Expenses',
          data: monthlyExpenses,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
        },
      ],
    };

    // --- Process Category Data for Bar Chart ---
    const categories = [...new Set(filteredExpenses.map(e => e.category))];
    const categoryColors = categories.reduce((acc, cat, i) => {
        acc[cat] = `hsl(${(i * 50) % 360}, 70%, 60%)`;
        return acc;
    }, {});
    
    const monthlyCategoryExpenses = {}; // e.g., { '0-Food': 500, '1-Food': 600 }
    filteredExpenses.forEach(({ date, category, amount }) => {
        const month = getMonth(date);
        const key = `${month}-${category}`;
        monthlyCategoryExpenses[key] = (monthlyCategoryExpenses[key] || 0) + amount;
    });

    const barChartData = {
        labels: MONTHS,
        datasets: categories.map(cat => ({
            label: cat,
            data: MONTHS.map((_, monthIndex) => monthlyCategoryExpenses[`${monthIndex}-${cat}`] || 0),
            backgroundColor: categoryColors[cat],
        }))
    };
    
    // --- KPI Calculations ---
    const totalExpenses = monthlyExpenses.reduce((sum, val) => sum + val, 0);
    const totalIncome = monthlyIncome.reduce((sum, val) => sum + val, 0);
    const netSavings = totalIncome - totalExpenses;
    
    const activeMonths = monthlyExpenses.filter(val => val > 0).length || 1;
    const avgMonthlyExpense = totalExpenses / activeMonths;

    const kpiData = {
      totalIncome,
      totalExpenses,
      netSavings,
      avgMonthlyExpense,
    };

    return { lineChartData, barChartData, kpiData, availableYears };
  }, [expenses, income, selectedYear]);
};