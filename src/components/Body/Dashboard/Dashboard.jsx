import { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from 'react-hot-toast'; 
import { PlusCircleIcon } from '@heroicons/react/24/solid'; 

import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import CategoryChart from "./CategoryChart"; 
import KpiCard from "./KpiCard"; 

const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0); // Keep this to trigger refetches

  const token = localStorage.getItem("token");

  // NEW: Fetching logic is moved to the parent dashboard
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/expenses/display-expense', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch expenses');
        const data = await res.json();
        setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
      } catch (e) {
        console.error(e);
        toast.error('Could not fetch expenses.');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [refreshToken, token]); // Re-fetch when refreshToken changes

  // NEW: Memoized calculations for KPIs and Chart
  const dashboardData = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTransactions = expenses.length;
    
    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryTotals).sort(([,a],[,b]) => b-a)[0] || ['N/A', 0];

    return {
      totalExpenses,
      totalTransactions,
      topCategory: { name: topCategory[0], amount: topCategory[1] },
      categoryTotals,
    };
  }, [expenses]);


  const handleExpenseAction = () => {
    setRefreshToken(prev => prev + 1); // Trigger a refresh
  };

  return (
    <>
      {/* NEW: Toaster component for notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* NEW: Modal for adding expenses */}
      {showAddForm && (
        <AddExpenseForm 
          onClose={() => setShowAddForm(false)} 
          onExpenseAdded={() => {
            handleExpenseAction();
            setShowAddForm(false);
            toast.success('Expense added successfully!');
          }}
        />
      )}

      <div className="space-y-6">
        {/* Dashboard Header */}
        <section className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Dashboard</h3>
              <p className="text-gray-600">Your expense dashboard overview.</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <PlusCircleIcon className="h-6 w-6" />
              Add Expense
            </button>
          </div>
        </section>

        {/* NEW: KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard title="Total Expenses" value={dashboardData.totalExpenses} format="currency" />
          <KpiCard title="Total Transactions" value={dashboardData.totalTransactions} />
          <KpiCard title="Top Spending Category" value={dashboardData.topCategory.name} subValue={dashboardData.topCategory.amount} />
        </div>

        {/* NEW: Chart and List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h4 className="text-xl font-semibold text-slate-700 mb-4">Spending by Category</h4>
            <CategoryChart data={dashboardData.categoryTotals} />
          </div>
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
             <ExpenseList 
                expenses={expenses}
                loading={loading}
                onAction={handleExpenseAction}
             />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;