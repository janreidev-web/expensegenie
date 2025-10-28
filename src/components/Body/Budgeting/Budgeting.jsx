import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// --- Reusable Child Components ---

// A single budget progress card
const BudgetCard = ({ category, spent, budget }) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  
  let progressBarColor = 'bg-blue-500'; // Green/Blue for under budget
  if (percentage > 90) progressBarColor = 'bg-red-500'; // Red for over budget
  else if (percentage > 75) progressBarColor = 'bg-yellow-500'; // Yellow for approaching limit

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="font-bold text-slate-700">{category}</h4>
      <div className="text-sm text-gray-500 mt-1">
        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(remaining)} remaining
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div className={progressBarColor} style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', borderRadius: 'inherit' }}></div>
      </div>
      <div className="text-xs text-right mt-1 text-gray-500">
        Spent: {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(spent)} of {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(budget)}
      </div>
    </div>
  );
};


// The Modal for the AI-Powered Savings Goal Assistant
const SavingsGoalModal = ({ expenses, budgets, onClose }) => {
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [months, setMonths] = useState(6);
  const [plan, setPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [searchPricing, setSearchPricing] = useState(false);
  const [pricingInfo, setPricingInfo] = useState(null);

  const generatePlan = async () => {
    // If searching for pricing, goalName is required but not goalAmount
    if (searchPricing && !goalName) {
      toast.error("Please enter what you're saving for so we can search for pricing.");
      return;
    }
    
    // If not searching, both are required
    if (!searchPricing && (!goalAmount || goalAmount <= 0)) {
      toast.error("Please enter a valid amount or enable price search.");
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("token");
      
      // Get last 3 months of expenses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const recentExpenses = expenses.filter(e => new Date(e.date) >= threeMonthsAgo);

      const res = await fetch('/api/ai/generate-budget-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          goalName: goalName || 'Your Goal',
          goalAmount: goalAmount ? parseFloat(goalAmount) : null,
          months,
          expenses: recentExpenses,
          currentBudgets: budgets,
          searchPricing: searchPricing && !goalAmount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlan(data.plan);
        setAiGenerated(data.aiGenerated);
        setPricingInfo(data.pricingInfo);
        
        if (data.pricingInfo) {
          toast.success(`🔍 Found pricing: ₱${data.pricingInfo.price.toLocaleString()}!`);
        } else {
          toast.success(data.aiGenerated ? '🤖 AI-powered plan generated!' : '✨ Smart plan generated!');
        }
      } else {
        toast.error(data.error || 'Failed to generate plan');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {!plan ? (
          <>
            <h3 className="text-xl font-bold mb-4">🤖 AI Budget Plan Generator</h3>
            <p className="text-sm text-gray-600 mb-4">Let AI help you create a personalized savings plan with accurate pricing and smart recommendations.</p>
            
            <input 
              type="text" 
              placeholder="What are you saving for? (e.g., iPhone 15 Pro, Gaming Laptop)" 
              value={goalName} 
              onChange={e => setGoalName(e.target.value)} 
              className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="mb-3">
              <label className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition">
                <input 
                  type="checkbox" 
                  checked={searchPricing} 
                  onChange={e => {
                    setSearchPricing(e.target.checked);
                    if (e.target.checked) setGoalAmount('');
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <span className="font-semibold text-purple-900">🔍 Search for current pricing automatically</span>
                  <p className="text-xs text-purple-700">AI will find the latest market price for you</p>
                </div>
              </label>
            </div>
            
            {!searchPricing && (
              <input 
                type="number" 
                placeholder="How much does it cost? (₱)" 
                value={goalAmount} 
                onChange={e => setGoalAmount(e.target.value)} 
                className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            
            <label className="block text-sm font-medium text-gray-700 mb-2">How many months to save?</label>
            <input 
              type="range" 
              min="1" 
              max="24" 
              value={months} 
              onChange={e => setMonths(parseInt(e.target.value))} 
              className="w-full mb-2"
            />
            <div className="text-center font-semibold text-lg mb-4 text-blue-600">{months} month{months > 1 && 's'}</div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button 
                onClick={generatePlan} 
                disabled={isGenerating}
                className={`px-4 py-2 ${isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition-colors flex items-center gap-2`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>🤖 Generate AI Plan</>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Your Plan: {plan.goalName}</h3>
                {aiGenerated && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🤖 AI Powered</span>}
              </div>

              {pricingInfo && (
                <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-700 font-semibold">🔍 Pricing Research</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{pricingInfo.itemName}</strong> - ₱{pricingInfo.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Source: {pricingInfo.source} {pricingInfo.notes && `• ${pricingInfo.notes}`}
                  </p>
                </div>
              )}
              
              <div className={`p-4 rounded-lg mb-4 ${plan.achievable ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className="font-semibold text-center text-lg">
                  Save <strong>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(plan.requiredMonthlySavings)}</strong> per month
                </p>
                <p className="text-sm text-center text-gray-600 mt-1">
                  {plan.achievable ? '✅ Achievable with these changes!' : '⚠️ Consider extending timeline'}
                </p>
              </div>

              {plan.analysis && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Analysis:</strong> {plan.analysis}
                  </p>
                </div>
              )}

              {plan.insights && plan.insights.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900 mb-2">💡 Key Insights:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {plan.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-700 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-4 border border-green-200">
                <strong className="text-green-700">Motivation:</strong> {plan.motivation}
              </p>
            </div>

            <h4 className="font-semibold mb-3">Recommended Budget Adjustments:</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {plan.cuts.map(({category, reduction, newBudget, tip}) => (
                <div key={category} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800">{category}</span>
                    <span className="text-red-600 font-bold">-{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(reduction)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    New budget: <strong>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(newBudget)}</strong>
                  </div>
                  {tip && (
                    <div className="text-xs text-gray-500 bg-white p-2 rounded mt-2">
                      💡 {tip}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-center">
                Total Monthly Savings: <span className="text-green-600">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(plan.totalSavings)}</span>
              </p>
              <p className="text-xs text-center text-gray-600 mt-1">
                {plan.achievable ? `You'll reach your goal in ${months} month${months > 1 ? 's' : ''}! 🎯` : 'Additional adjustments may be needed'}
              </p>
            </div>

            {plan.alternatives && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 mb-1">💭 Alternative Approach:</p>
                <p className="text-sm text-gray-700">{plan.alternatives}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => {setPlan(null); setPricingInfo(null);}} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                Try Another Goal
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition">
                Got it! 🚀
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


// --- The Main Budgeting Component ---

const Budgeting = () => {
  const [budgets, setBudgets] = useState({}); // e.g., { Food: 500, Leisure: 200 }
  const [expenses, setExpenses] = useState([]);
  const [currentSpending, setCurrentSpending] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [editableBudgets, setEditableBudgets] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // NOTE: Assumes you have an API to get user-defined budgets.
        const [budgetRes, expenseRes] = await Promise.all([
          fetch("/api/budgets/get", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/expenses/display-expense", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const budgetData = await budgetRes.json();
        const expenseData = await expenseRes.json();

        setBudgets(budgetData.budgets || {});
        setExpenses(expenseData.expenses || []);
        
        // Calculate current month's spending per category
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const currentMonthExpenses = (expenseData.expenses || []).filter(e => new Date(e.date) >= startOfMonth);
        
        const spending = currentMonthExpenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});
        setCurrentSpending(spending);

      } catch (err) {
        toast.error("Could not load budget data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  if (loading) return <div>Loading Budgets...</div>;

  const handleEditBudgets = () => {
    setEditableBudgets({ ...budgets });
    setShowEditBudget(true);
  };

  const handleSaveBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/budgets/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ budgets: editableBudgets }),
      });

      if (res.ok) {
        setBudgets(editableBudgets);
        setShowEditBudget(false);
        toast.success("Budgets updated successfully!");
      } else {
        toast.error("Failed to update budgets");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating budgets");
    }
  };

  return (
    <div className="space-y-6">
      {showAssistant && <SavingsGoalModal expenses={expenses} budgets={budgets} onClose={() => setShowAssistant(false)} />}

      {showEditBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Monthly Budgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(editableBudgets).map(([category, amount]) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setEditableBudgets(prev => ({ ...prev, [category]: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="100"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowEditBudget(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleSaveBudgets} className="px-4 py-2 bg-blue-600 text-white rounded">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Monthly Budgets</h3>
            <p className="text-gray-600">Your real-time spending progress for the current month.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleEditBudgets} className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
              Edit Budgets ✏️
            </button>
            <button onClick={() => setShowAssistant(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-4 rounded hover:from-purple-700 hover:to-blue-700 transition shadow-lg">
              🤖 AI Budget Plan Generator
            </button>
          </div>
        </div>
      </section>

      {Object.keys(budgets).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(budgets).map(([category, budgetAmount]) => (
            <BudgetCard 
              key={category}
              category={category}
              spent={currentSpending[category] || 0}
              budget={budgetAmount}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h4 className="text-xl font-semibold">No budgets set.</h4>
          <p className="text-gray-500 mt-2">Go to Settings to create your first monthly budget!</p>
        </div>
      )}
    </div>
  );
};

export default Budgeting;