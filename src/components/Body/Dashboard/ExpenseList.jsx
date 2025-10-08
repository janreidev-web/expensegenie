import React, { useMemo, useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Helper for category colors
const categoryColors = {
  Food: 'bg-red-100 text-red-800',
  Education: 'bg-blue-100 text-blue-800',
  Clothing: 'bg-pink-100 text-pink-800',
  Housing: 'bg-yellow-100 text-yellow-800',
  Healthcare: 'bg-green-100 text-green-800',
  Bills: 'bg-purple-100 text-purple-800',
  Leisure: 'bg-indigo-100 text-indigo-800',
  'Personal Needs': 'bg-gray-100 text-gray-800',
  Other: 'bg-gray-100 text-gray-800',
};
const categories = Object.keys(categoryColors);
const itemsPerPage = 5;

const ExpenseList = ({ expenses, loading, onAction }) => {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const token = localStorage.getItem('token');

  const deleteExpense = async (expense) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch('/api/expenses/delete-expense', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: expense._id }),
      });
      if (!res.ok) throw new Error('Server error');
      toast.success('Expense deleted!');
      if (onAction) onAction();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete expense.');
    }
  };

  const updateExpense = async (updatedExpense) => {
    try {
      const res = await fetch('/api/expenses/edit-expense', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedExpense),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Server error');
      };
      toast.success('Expense updated!');
      setSelectedExpense(null);
      if (onAction) onAction();
    } catch (e) {
      console.error(e);
      toast.error(`Failed to update expense: ${e.message}`);
    }
  };

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredSorted = useMemo(() => {
    let list = Array.isArray(expenses) ? [...expenses] : [];
    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.category || '').toLowerCase().includes(term) ||
          (e.description || '').toLowerCase().includes(term)
      );
    }
    if (sortConfig.key) {
      const { key, direction } = sortConfig;
      const dir = direction === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        let av = a[key];
        let bv = b[key];
        if (key === 'date') {
          av = new Date(av).getTime();
          bv = new Date(bv).getTime();
        } else if (key === 'amount') {
          av = Number(av);
          bv = Number(bv);
        } else {
          av = String(av || '').toLowerCase();
          bv = String(bv || '').toLowerCase();
        }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }
    return list;
  }, [expenses, searchTerm, sortConfig]);
  
  const totalPages = Math.ceil(filteredSorted.length / itemsPerPage) || 1;
  const currentExpenses = filteredSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const EditExpenseForm = ({ expense }) => {
    const [formData, setFormData] = useState({
      id: expense._id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
      date: expense.date?.split('T')[0] || '',
    });

    const handleChange = (e) => {
      // FIX 1: Destructure name and value from the event target
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (Number(formData.amount) <= 0) {
        toast.error('Amount must be greater than 0.');
        return;
      }
      updateExpense(formData);
    };

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setSelectedExpense(null)} />
        <form onSubmit={handleSubmit} className="fixed z-50 top-1/2 left-1/2 max-w-md w-full bg-white rounded-lg shadow-lg p-6 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>
          <label className="block mb-2">Category:
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full border rounded px-3 py-2 mt-1">
              {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </label>
          <label className="block mb-2">Amount:
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" min="0" required className="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label className="block mb-2">Description:
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label className="block mb-4">Date:
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setSelectedExpense(null)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </>
    );
  };
  
  return (
    <div className="w-full">
      <h4 className="text-xl font-semibold text-slate-700 mb-4">Recent Expenses</h4>
      <input
        type="text"
        placeholder="Search expenses..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th onClick={() => requestSort('category')} className="py-3 px-4 text-left cursor-pointer">Category</th>
                  <th onClick={() => requestSort('amount')} className="py-3 px-4 text-right cursor-pointer">Amount</th>
                  <th onClick={() => requestSort('date')} className="py-3 px-4 text-left cursor-pointer">Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentExpenses.length > 0 ? (
                  currentExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[expense.category] || categoryColors.Other}`}>{expense.category}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(expense.amount)}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(expense.date).toLocaleDateString('en-CA')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setSelectedExpense(expense)} className="text-gray-400 hover:text-blue-600"><PencilSquareIcon className="h-5 w-5"/></button>
                            <button onClick={() => deleteExpense(expense)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500">No expenses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* FIX 2: Added the pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
                <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md border bg-white font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Previous
                </button>
                <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
                </span>
                <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md border bg-white font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Next
                </button>
            </div>
          )}
        </>
      )}

      {selectedExpense && <EditExpenseForm expense={selectedExpense} />}
    </div>
  );
};

export default ExpenseList;