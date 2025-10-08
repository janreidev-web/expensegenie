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


// The Modal for the Savings Goal Assistant
const SavingsGoalModal = ({ expenses, budgets, onClose }) => {
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [months, setMonths] = useState(6);
  const [plan, setPlan] = useState(null);

  const generatePlan = () => {
    if (!goalAmount || goalAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    const requiredMonthlySavings = goalAmount / months;

    // 1. Identify discretionary categories (customize this list as needed)
    const discretionaryCategories = ['Food', 'Leisure', 'Clothing', 'Other', 'Personal Needs'];
    
    // 2. Calculate average monthly spending in those categories (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentExpenses = expenses.filter(e => new Date(e.date) >= threeMonthsAgo && discretionaryCategories.includes(e.category));
    
    const avgSpending = recentExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    Object.keys(avgSpending).forEach(cat => {
        avgSpending[cat] /= 3; // Get the monthly average
    });
    
    // 3. Generate a simple recommendation plan
    const sortedSpend = Object.entries(avgSpending).sort(([,a],[,b]) => b-a);
    let savingsFound = 0;
    const recommendedCuts = [];

    for (const [category, avgAmount] of sortedSpend) {
        if (savingsFound >= requiredMonthlySavings) break;
        // Suggest cutting up to 25% of the average spend in a category
        const potentialCut = avgAmount * 0.25;
        const cut = Math.min(potentialCut, requiredMonthlySavings - savingsFound);
        
        recommendedCuts.push({
            category,
            cut: Math.round(cut),
            newBudget: Math.round(budgets[category] - cut)
        });
        savingsFound += cut;
    }

    if (savingsFound < requiredMonthlySavings) {
      toast.error("That's an ambitious goal! The plan can't find enough savings from your typical spending. Try a longer timeframe.");
      return;
    }

    setPlan({
      goalName: goalName || "New Gadget",
      requiredMonthlySavings,
      cuts: recommendedCuts,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {!plan ? (
          <>
            <h3 className="text-xl font-bold mb-4">Savings Goal Assistant</h3>
            <input type="text" placeholder="What are you saving for? (e.g., iPhone)" value={goalName} onChange={e => setGoalName(e.target.value)} className="w-full p-2 border rounded mb-2"/>
            <input type="number" placeholder="How much does it cost?" value={goalAmount} onChange={e => setGoalAmount(parseFloat(e.target.value))} className="w-full p-2 border rounded mb-2"/>
            <label className="block text-sm mb-2">How many months to save?</label>
            <input type="range" min="1" max="24" value={months} onChange={e => setMonths(parseInt(e.target.value))} className="w-full mb-2"/>
            <div className="text-center font-semibold mb-4">{months} month{months > 1 && 's'}</div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={generatePlan} className="px-4 py-2 bg-blue-600 text-white rounded">Generate Plan</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Your Plan for: {plan.goalName}</h3>
            <p className="mb-4 text-center bg-blue-50 p-2 rounded">You need to save **{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(plan.requiredMonthlySavings)} / month**.</p>
            <h4 className="font-semibold mb-2">Recommended Budget Cuts:</h4>
            <ul className="list-disc list-inside space-y-2">
              {plan.cuts.map(({category, cut}) => (
                <li key={category}>Reduce **{category}** spending by **{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cut)}**.</li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
               <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Got it!</button>
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

  return (
    <div className="space-y-6">
      {showAssistant && <SavingsGoalModal expenses={expenses} budgets={budgets} onClose={() => setShowAssistant(false)} />}

      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Monthly Budgets</h3>
            <p className="text-gray-600">Your real-time spending progress for the current month.</p>
          </div>
          <button onClick={() => setShowAssistant(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition">
            Plan a New Purchase 💡
          </button>
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