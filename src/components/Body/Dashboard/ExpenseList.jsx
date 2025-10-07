import React, { useEffect, useMemo, useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const itemsPerPage = 10;
const categories = [
  'Food',
  'Education',
  'Clothing',
  'Housing',
  'Personal Needs',
  'Healthcare',
  'Leisure',
  'Bills',
  'Other',
];

const ExpenseList = ({ refreshToken }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const token = localStorage.getItem('token');

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
      alert('Something went wrong while fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []); // mount

  useEffect(() => {
    if (refreshToken != null) fetchExpenses();
  }, [refreshToken]); // refetch on trigger

  const deleteExpense = async (expense) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/expenses/delete-expense', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: expense._id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete expense');
      }
      fetchExpenses();
    } catch (e) {
      console.error(e);
      alert('Something went wrong while deleting expense');
    }
  };

  const updateExpense = async (updatedExpense) => {
    try {
      const res = await fetch('/api/expenses/edit-expense', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedExpense),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update expense');
      }
      setSelectedExpense(null);
      fetchExpenses();
    } catch (e) {
      console.error(e);
      alert('Something went wrong while updating expense');
    }
  };

  const requestSort = (key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = !term
      ? expenses
      : expenses.filter((e) =>
          (e.category || '').toLowerCase().includes(term) ||
          (e.description || '').toLowerCase().includes(term)
        );

    if (sortConfig.key) {
      const { key, direction } = sortConfig;
      const dir = direction === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
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
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentExpenses = filteredSorted.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const EditExpenseForm = ({ expense }) => {
    const [formData, setFormData] = useState({
      id: expense._id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
      date: expense.date?.split('T')[0] || '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError('');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (Number(formData.amount) <= 0) {
        setError('Please enter a valid amount greater than 0.');
        return;
      }
      await updateExpense(formData);
    };

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-10 z-40" onClick={() => setSelectedExpense(null)} />
        <form
          onSubmit={handleSubmit}
          className="fixed z-50 top-1/2 left-1/2 max-w-md w-full bg-white rounded-lg shadow-lg p-6 transform -translate-x-1/2 -translate-y-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>

          <label className="block mb-2">
            Category:
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 mt-1"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-2">
            Amount:
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label className="block mb-2">
            Description:
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label className="block mb-4">
            Date:
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setSelectedExpense(null)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex justify-end items-center gap-2">
        <input
          type="text"
          placeholder="Search by category or description..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-sm p-2 border border-gray-300 rounded"
        />
      </div>

      {loading ? (
        <p>Loading expenses...</p>
      ) : (
        <>
          <table className="w-full table-auto border border-gray-300 divide-y divide-gray-200">
            <thead className="bg-gray-100 cursor-pointer select-none">
              <tr>
                <th className="text-center px-4 py-3 font-medium text-gray-700 whitespace-nowrap" onClick={() => requestSort('category')}>
                  Category{sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 whitespace-nowrap" onClick={() => requestSort('amount')}>
                  Amount{sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 whitespace-nowrap">Description</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 whitespace-nowrap" onClick={() => requestSort('date')}>
                  Date{sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-500">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                currentExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="text-center px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]" title={expense.category}>
                      {expense.category}
                    </td>
                    <td className="text-center px-4 py-3 whitespace-nowrap">
                      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(expense.amount)}
                    </td>
                    <td className="text-center px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]" title={expense.description}>
                      {expense.description || '-'}
                    </td>
                    <td className="text-center px-4 py-3 whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-PH')}
                    </td>
                    <td className="text-center px-4 py-3 whitespace-nowrap flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedExpense(expense)}
                        title="Edit"
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit expense"
                      >
                        <PencilSquareIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense)}
                        title="Delete"
                        className="text-red-600 hover:text-red-800"
                        aria-label="Delete expense"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
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
