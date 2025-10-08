import { useState } from "react";
import { toast } from 'react-hot-toast';
import { ClipLoader } from "react-spinners";

// MODIFIED: Props now include onClose for closing the modal
const AddExpenseForm = ({ onClose, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error("Please enter an amount greater than 0.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/expenses/add-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (onExpenseAdded) onExpenseAdded();
      } else {
        toast.error(data.message || "Error adding expense");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // MODIFIED: This is now a modal with an overlay
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-2xl p-6 space-y-4 animate-fade-in-up"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Add New Expense</h2>

          {/* Form fields are the same, but with better styling */}
          <select name="category" value={formData.category} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
             <option value="" disabled>Select category</option>
             <option>Food</option><option>Education</option><option>Clothing</option>
             <option>Housing</option><option>Personal Needs</option><option>Healthcare</option>
             <option>Leisure</option><option>Bills</option><option>Other</option>
          </select>

          <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>

          <input type="text" name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>

          <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
            <button
              type="submit"
              className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? <ClipLoader size={20} color="#fff" /> : "Add"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddExpenseForm;