import { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const useTrendsData = (expenses = [], income = [], selectedYear) => {
  return useMemo(() => {
    // --- Data Preparation ---
    const getYear = (dateStr) => dateStr.slice(0, 4);
    const getMonth = (dateStr) => parseInt(dateStr.slice(5, 7), 10) - 1; // 0-indexed

    const availableYears = [
      ...new Set([...expenses.map(e => getYear(e.date)), ...income.map(i => getYear(i.date))])
    ].sort((a, b) => b - a);

    if (!selectedYear || availableYears.length === 0) {
      return { lineChartData: null, barChartData: null, kpiData: null, tableData: [], availableYears: [] };
    }
    
    // --- (The rest of your existing data processing logic stays the same) ---
    const filteredExpenses = expenses.filter(e => getYear(e.date) === selectedYear);
    const filteredIncome = income.filter(i => getYear(i.date) === selectedYear);

    const monthlyExpenses = Array(12).fill(0);
    const monthlyIncome = Array(12).fill(0);

    filteredExpenses.forEach(({ date, amount }) => {
      monthlyExpenses[getMonth(date)] += amount;
    });
    filteredIncome.forEach(({ date, amount }) => {
      monthlyIncome[getMonth(date)] += amount;
    });

    // ... (lineChartData, barChartData, and kpiData calculations remain the same)
    
    // NEW: Prepare data for the breakdown table
    const tableData = MONTHS.map((month, index) => {
        const incomeVal = monthlyIncome[index];
        const expensesVal = monthlyExpenses[index];
        const netVal = incomeVal - expensesVal;
        return {
            month,
            income: incomeVal,
            expenses: expensesVal,
            net: netVal,
        };
    });

    // --- (KPI Calculations remain the same) ---
    const totalExpenses = monthlyExpenses.reduce((sum, val) => sum + val, 0);
    const totalIncome = monthlyIncome.reduce((sum, val) => sum + val, 0);
    const netSavings = totalIncome - totalExpenses;
    const activeMonths = monthlyExpenses.filter(val => val > 0).length || 1;
    const avgMonthlyExpense = totalExpenses / activeMonths;

    // ... (Your lineChartData and barChartData objects are here)

    return { 
        // lineChartData, barChartData are here...
        kpiData: { totalIncome, totalExpenses, netSavings, avgMonthlyExpense }, 
        tableData, // NEW: Return table data
        availableYears 
    };
  }, [expenses, income, selectedYear]);
};