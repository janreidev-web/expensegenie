import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    // AI-powered categorization using OpenAI (if API key is available)
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
                content: 'You are a financial assistant that categorizes expenses. Respond with only ONE of these categories: Food, Education, Clothing, Housing, Personal Needs, Healthcare, Leisure, Bills, Other. No explanations, just the category name.'
              },
              {
                role: 'user',
                content: `Categorize this expense: "${description}"`
              }
            ],
            max_tokens: 20,
            temperature: 0.3,
          }),
        });

        const data = await response.json();
        const category = data.choices?.[0]?.message?.content?.trim();

        if (category) {
          return res.status(200).json({ category });
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        // Fall through to rule-based categorization
      }
    }

    // Fallback: Rule-based categorization
    const categoryKeywords = {
      Food: ['food', 'restaurant', 'grocery', 'cafe', 'lunch', 'dinner', 'breakfast', 'snack', 'meal', 'pizza', 'burger', 'coffee', 'tea', 'jollibee', 'mcdo', 'market'],
      Education: ['book', 'course', 'tuition', 'school', 'university', 'class', 'education', 'training', 'seminar', 'workshop', 'udemy', 'coursera'],
      Clothing: ['clothes', 'shirt', 'pants', 'shoes', 'dress', 'jacket', 'fashion', 'apparel', 'nike', 'adidas', 'uniqlo', 'h&m'],
      Housing: ['rent', 'mortgage', 'apartment', 'condo', 'house', 'furniture', 'repair', 'maintenance', 'home depot', 'ikea'],
      'Personal Needs': ['soap', 'shampoo', 'toothpaste', 'hygiene', 'personal care', 'grooming', 'haircut', 'salon', 'barber'],
      Healthcare: ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health', 'clinic', 'dentist', 'vaccine', 'checkup', 'mercury drug'],
      Leisure: ['movie', 'game', 'entertainment', 'concert', 'hobby', 'spotify', 'netflix', 'gaming', 'gym', 'travel', 'vacation', 'cinema'],
      Bills: ['electricity', 'water', 'internet', 'phone', 'bill', 'utility', 'cable', 'subscription', 'meralco', 'pldt', 'globe', 'smart'],
    };

    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return res.status(200).json({ category });
      }
    }

    // Default category if no match found
    return res.status(200).json({ category: 'Other' });

  } catch (error) {
    console.error('Categorization error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Server error during categorization' });
  }
}
