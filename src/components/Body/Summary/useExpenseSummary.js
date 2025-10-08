import { useMemo } from 'react';

// A custom hook to encapsulate all summary calculations
export const useExpenseSummary = (expenses, selectedDate) => {
  return useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { pieData: null, barData: null, kpiData: null, availableMonths: [] };
    }

    // --- Data Preparation ---
    const allMonths = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse();
    const targetMonth = selectedDate || allMonths[0];

    const filteredExpenses = expenses.filter(e => e.date.startsWith(targetMonth));

    if (filteredExpenses.length === 0) {
      return { pieData: null, barData: null, kpiData: null, availableMonths: allMonths };
    }

    // --- KPI Card Calculations ---
    const categoryTotals = filteredExpenses.reduce((acc, { category, amount }) => {
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    const totalSpending = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const topCategoryEntry = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
    
    const kpiData = {
      totalSpending,
      transactionCount: filteredExpenses.length,
      topCategory: topCategoryEntry ? topCategoryEntry[0] : 'N/A',
      topCategoryAmount: topCategoryEntry ? topCategoryEntry[1] : 0,
    };

    // --- Pie Chart Data ---
    const pieData = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'],
        hoverOffset: 4,
      }],
    };
    
    // --- Bar Chart Data (Daily spending for the selected month) ---
    const dailyTotals = filteredExpenses.reduce((acc, { date, amount }) => {
      const day = new Date(date).getDate();
      acc[day] = (acc[day] || 0) + amount;
      return acc;
    }, {});

    const daysInMonth = new Date(targetMonth.slice(0, 4), targetMonth.slice(5, 7), 0).getDate();
    const barLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const barData = {
      labels: barLabels,
      datasets: [{
        label: `Daily Spending for ${targetMonth}`,
        data: barLabels.map(day => dailyTotals[day] || 0),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      }],
    };

    return { pieData, barData, kpiData, availableMonths: allMonths };
  }, [expenses, selectedDate]);
};