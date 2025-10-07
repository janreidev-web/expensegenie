import React, { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ClipLoader } from "react-spinners";

const AddExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: '',
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    const token = localStorage.getItem("token");

    setShowOverlay(true);
    setIsLoading(true);
    setError("");

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
        setFormData({
          category: '',
          amount: '',
          description: '',
          date: '',
        });

        setIsSuccess(true);
        if (onExpenseAdded) onExpenseAdded();

        setTimeout(() => {
          setShowOverlay(false);
          setIsSuccess(false);
        }, 2000);
      } else {
        setError(data.message || "Error adding expense");
        setShowOverlay(false);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setShowOverlay(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full relative">
      {/* Overlay Loading / Success */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-lg">
            {isLoading && (
              <>
                <ClipLoader size={40} color="#16a34a" />
                <p className="mt-4 text-gray-700 font-medium">Submitting...</p>
              </>
            )}
            {isSuccess && (
              <>
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
                <p className="mt-4 text-green-700 font-semibold text-lg">Expense Added!</p>
              </>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4 p-6 border border-gray-300 rounded bg-white shadow-md"
      >
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled>
            Select category
          </option>
          <option>Food</option>
          <option>Education</option>
          <option>Clothing</option>
          <option>Housing</option>
          <option>Personal Needs</option>
          <option>Healthcare</option>
          <option>Leisure</option>
          <option>Bills</option>
          <option>Other</option>
        </select>

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />

        {error && (
          <p className="text-red-600 font-semibold text-center">{error}</p>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
            disabled={isLoading}
          >
            Submit Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;
