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

// Savings Goal Card
const GoalCard = ({ goal }) => {
  const percentage = goal.goalAmount > 0 ? (goal.currentSavings / goal.goalAmount) * 100 : 0;
  const remaining = goal.goalAmount - goal.currentSavings;
  const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-lg shadow-lg border border-purple-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-purple-900">{goal.goalName}</h4>
          <p className="text-sm text-purple-700 mt-1">
            Target: {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(goal.goalAmount)}
          </p>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🎯 {goal.months} months</span>
      </div>
      
      {goal.pricingInfo && (
        <div className="mb-3 p-2 bg-white/60 rounded text-xs text-gray-700">
          🔍 <strong>{goal.pricingInfo.itemName}</strong> - ₱{goal.pricingInfo.price.toLocaleString()}
        </div>
      )}
      
      <div className="w-full bg-purple-200 rounded-full h-3 mb-2">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm mb-3">
        <span className="text-purple-700 font-semibold">
          Saved: ₱{goal.currentSavings.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
        <span className="text-purple-600">
          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
        </span>
      </div>
      
      <div className="text-sm text-purple-800 bg-white/50 p-3 rounded">
        <strong>Monthly Target:</strong> ₱{goal.plan.requiredMonthlySavings.toLocaleString()}
        <div className="text-xs text-purple-600 mt-1">
          Remaining: ₱{remaining.toLocaleString()}
        </div>
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
    // Validate goal name
    if (!goalName || goalName.trim() === '') {
      toast.error("Please enter what you're saving for.");
      return;
    }

    // Parse and validate goal amount
    const parsedAmount = goalAmount ? parseFloat(goalAmount) : null;
    
    // If searching for pricing, don't require amount
    if (searchPricing) {
      // Just need goal name for pricing search
      if (!goalName.trim()) {
        toast.error("Please enter what you're saving for so we can search for pricing.");
        return;
      }
    } else {
      // Not searching - require valid amount
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Please enter a valid amount greater than 0, or enable price search.");
        return;
      }
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("token");
      
      // Get last 3 months of expenses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const recentExpenses = expenses.filter(e => new Date(e.date) >= threeMonthsAgo);

      // Validate we have expenses
      if (recentExpenses.length === 0) {
        toast.error("You need at least some expense history to generate a budget plan. Add some expenses first!");
        setIsGenerating(false);
        return;
      }

      const res = await fetch('/api/ai/generate-budget-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          goalName: goalName.trim(),
          goalAmount: parsedAmount,
          months: parseInt(months),
          expenses: recentExpenses,
          currentBudgets: budgets || {},
          searchPricing: searchPricing && !parsedAmount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlan(data.plan);
        setAiGenerated(data.aiGenerated);
        setPricingInfo(data.pricingInfo);
        
        // Save the goal to database
        try {
          await fetch('/api/goals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              goalName: goalName.trim(),
              goalAmount: data.plan.goalAmount,
              months: parseInt(months),
              plan: data.plan,
              pricingInfo: data.pricingInfo,
            }),
          });
        } catch (saveError) {
          console.error('[Save Goal] Error:', saveError);
          // Don't show error to user, it's not critical
        }
        
        if (data.pricingInfo) {
          toast.success(`🔍 Found pricing: ₱${data.pricingInfo.price.toLocaleString()}!`, { duration: 4000 });
        } else {
          toast.success(data.aiGenerated ? '🤖 AI-powered plan generated!' : '✨ Smart plan generated!');
        }
      } else {
        // Handle pricing search failure gracefully
        if (data.error && data.error.includes('Could not find pricing')) {
          toast.error("⚠️ Automatic pricing search is currently unavailable. Please enter the amount manually.", { duration: 6000 });
          // Disable pricing search and let user try again with manual amount
          setSearchPricing(false);
        } else {
          // Show the specific error message from the server
          const errorMsg = data.error || 'Failed to generate plan';
          toast.error(errorMsg, { duration: 5000 });
        }
        
        // Log for debugging
        console.error('[Budget Plan Error]', data);
      }
    } catch (err) {
      console.error('[Budget Plan Error]', err);
      toast.error('Network error. Please check your connection and try again.', { duration: 5000 });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                <div className="flex-1">
                  <span className="font-semibold text-purple-900">🔍 Search for current pricing automatically</span>
                  <p className="text-xs text-purple-700">AI will find the latest market price for you</p>
                  <p className="text-xs text-purple-600 mt-1 italic">Note: Requires OpenAI API key for automatic pricing</p>
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
              <button onClick={() => {onClose(); window.location.reload();}} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition">
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
  const [goals, setGoals] = useState([]); // Savings goals
  const [loading, setLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [editableBudgets, setEditableBudgets] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch budgets, expenses, and goals
        const [budgetRes, expenseRes, goalsRes] = await Promise.all([
          fetch("/api/budgets/get", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/expenses/display-expense", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/goals", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const budgetData = await budgetRes.json();
        const expenseData = await expenseRes.json();
        
        // Handle goals fetch gracefully
        let goalsData = { goals: [] };
        try {
          if (goalsRes.ok) {
            goalsData = await goalsRes.json();
          } else {
            console.error('[Goals] Failed to fetch:', goalsRes.status);
          }
        } catch (goalsError) {
          console.error('[Goals] Error parsing response:', goalsError);
        }

        setBudgets(budgetData.budgets || {});
        setExpenses(expenseData.expenses || []);
        setGoals(goalsData.goals || []);
        
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Budgets...</p>
        </div>
      </div>
    );
  }

  const handleEditBudgets = () => {
    setEditableBudgets({ ...budgets });
    setShowEditBudget(true);
  };

  const handleSaveBudgets = async () => {
    setIsSaving(true);
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
        toast.success("Budget Updated Successfully! 🎉");
      } else {
        const errorData = await res.json();
        console.error("[Budget Update] Error response:", errorData);
        toast.error(errorData.details || errorData.error || "Failed to update budgets");
      }
    } catch (err) {
      console.error("[Budget Update] Exception:", err);
      toast.error("Error updating budgets");
    } finally {
      setIsSaving(false);
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
              <button 
                onClick={() => setShowEditBudget(false)} 
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBudgets} 
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
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

      {/* Savings Goals Section */}
      {goals.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🎯</span> Savings Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Monthly Budgets Section */}
      <section>
        <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Monthly Budgets</h3>
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
      </section>
    </div>
  );
};

export default Budgeting;
