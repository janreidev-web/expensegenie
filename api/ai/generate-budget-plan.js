import jwt from 'jsonwebtoken';
import Cors from 'cors';
import initMiddleware from '../../utils/init-middleware.js';

const cors = initMiddleware(
  Cors({
    methods: ['POST', 'OPTIONS'],
    origin: '*',
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const { goalName, goalAmount, months, expenses, currentBudgets, searchPricing } = req.body;

  // Validation
  if (!months || !expenses || !Array.isArray(expenses)) {
    return res.status(400).json({ error: 'Missing required fields: months and expenses are required' });
  }

  // Check if we have either goalAmount or searchPricing enabled
  if (!goalAmount && !searchPricing) {
    return res.status(400).json({ error: 'Please enter a goal amount or enable price search' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    let finalGoalAmount = goalAmount ? parseFloat(goalAmount) : null;
    let pricingInfo = null;

    // If searchPricing is true and goalName is provided, search for pricing
    if (searchPricing && goalName && !finalGoalAmount) {
      try {
        pricingInfo = await searchItemPricing(goalName);
        finalGoalAmount = pricingInfo.price;
        
        // Validate the price returned from search
        if (!finalGoalAmount || isNaN(finalGoalAmount) || finalGoalAmount <= 0) {
          console.error('[Price Search] Invalid price returned:', pricingInfo);
          return res.status(400).json({ 
            error: 'Pricing search returned invalid data. Please enter the amount manually.',
            details: `Received price: ${finalGoalAmount}`
          });
        }
      } catch (searchError) {
        console.error('[Price Search] Error:', searchError.message);
        return res.status(400).json({ 
          error: 'Could not find pricing information. Please enter the amount manually.',
          details: searchError.message
        });
      }
    }

    // Final validation of goal amount
    if (!finalGoalAmount || isNaN(finalGoalAmount) || finalGoalAmount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid goal amount. Please provide a valid amount greater than 0.' 
      });
    }

    // Calculate required monthly savings
    const requiredMonthlySavings = finalGoalAmount / months;

    // Try Gemini first (free tier available)
    if (process.env.GEMINI_API_KEY) {
      try {
        const plan = await generateGeminiPlan(
          goalName, 
          finalGoalAmount, 
          months, 
          expenses, 
          currentBudgets, 
          requiredMonthlySavings,
          pricingInfo
        );
        return res.status(200).json({ plan, aiGenerated: true, pricingInfo });
      } catch (geminiError) {
        console.error('[AI Budget Plan] Gemini error:', geminiError.message);
        // Fall through to OpenAI
      }
    }

    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const plan = await generateAIPlanWithAnalysis(
          goalName, 
          finalGoalAmount, 
          months, 
          expenses, 
          currentBudgets, 
          requiredMonthlySavings,
          pricingInfo
        );
        return res.status(200).json({ plan, aiGenerated: true, pricingInfo });
      } catch (aiError) {
        console.error('[AI Budget Plan] OpenAI error:', aiError.message);
        // Fall through to rule-based system
      }
    }

    // Final Fallback: Smart rule-based plan with deep analysis
    const plan = generateAdvancedPlan(
      goalName, 
      finalGoalAmount, 
      months, 
      expenses, 
      currentBudgets, 
      requiredMonthlySavings,
      pricingInfo
    );
    return res.status(200).json({ plan, aiGenerated: false, pricingInfo });

  } catch (error) {
    console.error('[Generate Budget Plan] Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Server error during budget plan generation' });
  }
}

// Search for item pricing using AI (OpenAI or Gemini)
async function searchItemPricing(itemName) {
  const prompt = `What is the approximate current market price in Philippine Pesos (PHP/₱) for: "${itemName}"?

IMPORTANT: You must provide a realistic numeric price based on current market prices in the Philippines.

Example for "iPhone 15 Pro":
{
  "itemName": "iPhone 15 Pro",
  "price": 65990,
  "source": "Based on typical Philippine retail prices",
  "notes": "128GB base model"
}

Now provide the pricing for "${itemName}" in this EXACT JSON format (numbers only, no commas or currency symbols):
{
  "itemName": "${itemName}",
  "price": <numeric_value_only>,
  "source": "brief source description",
  "notes": "optional notes"
}`;

  // Try Gemini first (free tier available)
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          }
        }),
      });

      const data = await response.json();
      
      // Check for API errors
      if (!response.ok) {
        throw new Error(`Gemini API error: ${data.error?.message || JSON.stringify(data)}`);
      }
      
      // Log the full response for debugging
      console.log('[Price Search] Gemini response:', JSON.stringify(data));
      
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (aiResponse) {
        console.log('[Price Search] AI text:', aiResponse);
        
        // Remove markdown code blocks if present
        let cleanResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const pricingData = JSON.parse(jsonMatch[0]);
          const price = parseFloat(pricingData.price);
          
          // Validate the price
          if (!price || isNaN(price) || price <= 0) {
            throw new Error(`Invalid price from Gemini: ${pricingData.price}`);
          }
          
          return {
            itemName: pricingData.itemName || itemName,
            price: price,
            source: pricingData.source || 'Gemini AI Market Research',
            notes: pricingData.notes || null,
          };
        }
        throw new Error('Could not find JSON in Gemini response');
      }
      throw new Error('No response from Gemini API');
    } catch (error) {
      console.error('[Price Search] Gemini pricing failed:', error.message);
      // Don't silently fail - throw to trigger fallback
      throw error;
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides current market pricing information. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content?.trim();

      if (aiResponse) {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const pricingData = JSON.parse(jsonMatch[0]);
          return {
            itemName: pricingData.itemName || itemName,
            price: parseFloat(pricingData.price) || 0,
            source: pricingData.source || 'OpenAI Market Research',
            notes: pricingData.notes || null,
          };
        }
      }
    } catch (error) {
      console.error('[Price Search] OpenAI pricing failed:', error.message);
    }
  }

  // No AI available
  throw new Error('Pricing search unavailable. Please enter amount manually or add GEMINI_API_KEY/OPENAI_API_KEY to environment variables.');
}

// Gemini-Powered Budget Plan Generation
async function generateGeminiPlan(goalName, goalAmount, months, expenses, currentBudgets, requiredMonthlySavings, pricingInfo) {
  // Deep spending analysis
  const categorySpending = {};
  const monthlySpending = {};
  
  expenses.forEach(exp => {
    categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
    const month = exp.date.slice(0, 7);
    monthlySpending[month] = (monthlySpending[month] || 0) + exp.amount;
  });

  const avgMonthlySpend = Object.values(monthlySpending).reduce((a, b) => a + b, 0) / Math.max(Object.keys(monthlySpending).length, 1);
  const spendingSummary = Object.entries(categorySpending)
    .map(([cat, amt]) => `${cat}: ₱${amt.toFixed(0)}`)
    .join(', ');

  const pricingContext = pricingInfo 
    ? `\n\nPricing Research: The item "${pricingInfo.itemName}" costs approximately ₱${pricingInfo.price.toLocaleString()} (${pricingInfo.source}).` 
    : '';

  const prompt = `You are an expert financial advisor analyzing someone's budget to help them save for a specific goal.

GOAL DETAILS:
- Item: ${goalName || 'their goal'}
- Total Cost: ₱${goalAmount.toLocaleString()}
- Timeline: ${months} month(s)
- Required Monthly Savings: ₱${requiredMonthlySavings.toFixed(0)}${pricingContext}

CURRENT FINANCIAL SITUATION:
- Average Monthly Spending: ₱${avgMonthlySpend.toFixed(0)}
- Spending by Category (last 3 months): ${spendingSummary}
- Current Monthly Budgets: ${JSON.stringify(currentBudgets)}

ANALYSIS REQUIRED:
1. Identify realistic areas to cut spending (max 30% per category, prioritize discretionary)
2. Calculate if the goal is achievable within the timeline
3. Provide specific, actionable tips for each recommended cut
4. Suggest alternative strategies if the goal seems too ambitious
5. Include a motivational insight based on their spending patterns

Response Format (JSON only):
{
  "analysis": "Brief overview of their spending habits",
  "cuts": [
    {"category": "Food", "reduction": 500, "newBudget": 2500, "tip": "Meal prep on Sundays, pack lunch 4x/week"}
  ],
  "totalMonthlySavings": 1500,
  "motivation": "Encouraging message with specific praise",
  "achievable": true,
  "alternatives": "Optional: Suggest if timeline should be extended",
  "insights": ["Spending pattern 1", "Opportunity 2"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  });

  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!aiResponse) throw new Error('No Gemini response');

  // Remove markdown code blocks if present
  let cleanResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // Parse JSON response
  const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON in Gemini response');

  const planData = JSON.parse(jsonMatch[0]);

  return {
    goalName: goalName || 'Your Goal',
    goalAmount,
    months,
    requiredMonthlySavings,
    analysis: planData.analysis || null,
    cuts: planData.cuts || [],
    totalSavings: planData.totalMonthlySavings || 0,
    motivation: planData.motivation || 'You can do it!',
    achievable: planData.achievable !== false,
    alternatives: planData.alternatives || null,
    insights: planData.insights || [],
  };
}

// Enhanced AI-Powered Plan with Deep Analysis
async function generateAIPlanWithAnalysis(goalName, goalAmount, months, expenses, currentBudgets, requiredMonthlySavings, pricingInfo) {
  // Deep spending analysis
  const categorySpending = {};
  const monthlySpending = {};
  
  expenses.forEach(exp => {
    categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
    const month = exp.date.slice(0, 7);
    monthlySpending[month] = (monthlySpending[month] || 0) + exp.amount;
  });

  const avgMonthlySpend = Object.values(monthlySpending).reduce((a, b) => a + b, 0) / Math.max(Object.keys(monthlySpending).length, 1);
  const spendingSummary = Object.entries(categorySpending)
    .map(([cat, amt]) => `${cat}: ₱${amt.toFixed(0)}`)
    .join(', ');

  const pricingContext = pricingInfo 
    ? `\n\nPricing Research: The item "${pricingInfo.itemName}" costs approximately ₱${pricingInfo.price.toLocaleString()} (${pricingInfo.source}).` 
    : '';

  const prompt = `You are an expert financial advisor analyzing someone's budget to help them save for a specific goal.

GOAL DETAILS:
- Item: ${goalName || 'their goal'}
- Total Cost: ₱${goalAmount.toLocaleString()}
- Timeline: ${months} month(s)
- Required Monthly Savings: ₱${requiredMonthlySavings.toFixed(0)}${pricingContext}

CURRENT FINANCIAL SITUATION:
- Average Monthly Spending: ₱${avgMonthlySpend.toFixed(0)}
- Spending by Category (last 3 months): ${spendingSummary}
- Current Monthly Budgets: ${JSON.stringify(currentBudgets)}

ANALYSIS REQUIRED:
1. Identify realistic areas to cut spending (max 30% per category, prioritize discretionary)
2. Calculate if the goal is achievable within the timeline
3. Provide specific, actionable tips for each recommended cut
4. Suggest alternative strategies if the goal seems too ambitious
5. Include a motivational insight based on their spending patterns

Response Format (JSON only):
{
  "analysis": "Brief overview of their spending habits",
  "cuts": [
    {"category": "Food", "reduction": 500, "newBudget": 2500, "tip": "Meal prep on Sundays, pack lunch 4x/week"}
  ],
  "totalMonthlySavings": 1500,
  "motivation": "Encouraging message with specific praise",
  "achievable": true,
  "alternatives": "Optional: Suggest if timeline should be extended",
  "insights": ["Spending pattern 1", "Opportunity 2"]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial advisor specializing in personalized budget planning. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content?.trim();

  if (!aiResponse) throw new Error('No AI response');

  // Parse JSON response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON in AI response');

  const planData = JSON.parse(jsonMatch[0]);

  return {
    goalName: goalName || 'Your Goal',
    goalAmount,
    months,
    requiredMonthlySavings,
    analysis: planData.analysis || null,
    cuts: planData.cuts || [],
    totalSavings: planData.totalMonthlySavings || 0,
    motivation: planData.motivation || 'You can do it!',
    achievable: planData.achievable !== false,
    alternatives: planData.alternatives || null,
    insights: planData.insights || [],
  };
}

// Advanced Rule-Based Plan with Deep Spending Analysis
function generateAdvancedPlan(goalName, goalAmount, months, expenses, currentBudgets, requiredMonthlySavings, pricingInfo) {
  // Comprehensive spending analysis
  const discretionaryCategories = ['Food', 'Leisure', 'Clothing', 'Other', 'Personal Needs', 'Entertainment'];
  const categorySpending = {};
  const monthlyTotals = {};
  const categoryTrends = {};
  
  expenses.forEach(exp => {
    // Category totals
    categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
    
    // Monthly totals
    const month = exp.date.slice(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    
    // Category trends
    if (!categoryTrends[exp.category]) categoryTrends[exp.category] = [];
    categoryTrends[exp.category].push({ date: exp.date, amount: exp.amount });
  });

  const monthsInData = Math.max(1, Object.keys(monthlyTotals).length);
  const avgMonthlySpend = Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / monthsInData;
  
  // Calculate average spending per category
  Object.keys(categorySpending).forEach(cat => {
    categorySpending[cat] /= monthsInData;
  });

  // Analyze spending patterns and generate insights
  const insights = [];
  const sortedCategories = Object.entries(categorySpending)
    .filter(([cat]) => discretionaryCategories.includes(cat))
    .sort(([,a], [,b]) => b - a);

  // Generate insights
  if (sortedCategories.length > 0) {
    const topCategory = sortedCategories[0];
    const topCategoryPercent = (topCategory[1] / avgMonthlySpend) * 100;
    insights.push(`${topCategory[0]} accounts for ${topCategoryPercent.toFixed(0)}% of your monthly spending`);
  }

  if (avgMonthlySpend < requiredMonthlySavings * 1.5) {
    insights.push('Your spending is already lean - consider a longer timeline');
  }

  let savingsAccumulated = 0;
  const cuts = [];

  // Generate intelligent recommendations
  for (const [category, avgSpending] of sortedCategories) {
    if (savingsAccumulated >= requiredMonthlySavings) break;

    const currentBudget = currentBudgets[category] || avgSpending;
    const remainingNeeded = requiredMonthlySavings - savingsAccumulated;

    // Smart reduction percentages based on category and spending patterns
    let reductionPercent = 0.15;
    
    if (category === 'Leisure' || category === 'Entertainment') reductionPercent = 0.30;
    else if (category === 'Food') {
      // If food spending is high, allow more reduction
      reductionPercent = avgSpending > 5000 ? 0.20 : 0.10;
    }
    else if (category === 'Clothing') reductionPercent = 0.25;
    else if (category === 'Other') reductionPercent = 0.20;

    const potentialReduction = Math.min(
      currentBudget * reductionPercent,
      remainingNeeded
    );

    const reduction = Math.round(potentialReduction);
    const newBudget = Math.round(currentBudget - reduction);

    if (reduction > 0) {
      cuts.push({
        category,
        reduction,
        newBudget,
        tip: getAdvancedTipForCategory(category, reductionPercent, avgSpending)
      });
      savingsAccumulated += reduction;
    }
  }

  const achievable = savingsAccumulated >= requiredMonthlySavings * 0.9;
  const analysis = `Based on ${monthsInData} months of data, your average monthly spending is ₱${avgMonthlySpend.toFixed(0)}. ${
    achievable ? 'Your goal is achievable with the recommended budget adjustments.' : 'This goal is ambitious given your current spending patterns.'
  }`;

  const alternatives = !achievable 
    ? `Consider extending your timeline to ${Math.ceil(months * 1.5)} months, or look for additional income opportunities.`
    : null;

  return {
    goalName: goalName || 'Your Goal',
    goalAmount,
    months,
    requiredMonthlySavings,
    analysis,
    cuts,
    totalSavings: savingsAccumulated,
    motivation: achievable 
      ? `Excellent! You can realistically save ₱${savingsAccumulated.toFixed(0)}/month. Stay focused and you'll reach your goal! 🎯`
      : `This goal requires significant changes. Consider breaking it into smaller milestones or extending your timeline.`,
    achievable,
    alternatives,
    insights,
  };
}

function getAdvancedTipForCategory(category, reduction, avgSpending) {
  const tips = {
    Food: reduction > 0.15 
      ? `Your food spending (₱${avgSpending.toFixed(0)}/month) has room for optimization. Try meal prepping on weekends, bringing lunch 4-5x/week, and limiting dining out to special occasions.`
      : `Cook at home more often, use grocery lists to avoid impulse buys, and try batch cooking to save time and money.`,
    Leisure: `Focus on free or low-cost activities: hiking, free museum days, library resources, YouTube workouts instead of gym, game nights with friends.`,
    Entertainment: `Review all subscriptions monthly. Share streaming services with family. Download content for offline viewing. Look for student/senior discounts.`,
    Clothing: `Implement a 30-day rule before non-essential purchases. Shop end-of-season sales. Try thrift stores and clothing swaps. Focus on versatile, quality pieces.`,
    'Personal Needs': `Switch to generic brands (often same quality, 30-50% cheaper). Stock up during sales. Use cashback apps. Make your own cleaning products.`,
    Other: `Track every expense for one month to identify hidden spending. Use the 24-hour rule for impulse purchases. Set up automatic transfers to savings right after payday.`,
  };

  return tips[category] || `Look for creative ways to reduce spending in this category. Every small saving adds up!`;
}

function getTipForCategory(category, reduction) {
  const tips = {
    Food: reduction > 0.15 
      ? 'Meal prep on weekends, pack lunch, limit dining out to once a week'
      : 'Cook at home more often, use grocery lists to avoid impulse buys',
    Leisure: 'Try free activities like hiking, library books, or free community events',
    Entertainment: 'Cancel unused subscriptions, share streaming services with family',
    Clothing: 'Wait for sales, try thrift stores, follow the "30-day rule" before buying',
    'Personal Needs': 'Buy generic brands, use coupons, stock up during sales',
    Other: 'Track every expense, eliminate impulse purchases, use cash instead of cards',
  };

  return tips[category] || 'Look for ways to reduce spending in this category';
}
