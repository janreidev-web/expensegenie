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
                content: `You are a financial assistant that categorizes expenses. Respond with ONLY ONE category name from this exact list:
- Food (meals, groceries, restaurants, cafes)
- Education (books, courses, tuition, school supplies, test papers, exams, study materials)
- Clothing (clothes, shoes, accessories, fashion)
- Housing (rent, mortgage, furniture, home repairs)
- Personal Needs (hygiene products, grooming, personal care)
- Healthcare (medical, doctor, pharmacy, hospital)
- Leisure (entertainment, hobbies, movies, games, travel, gym)
- Bills (utilities, internet, phone, subscriptions)
- Other (anything that doesn't fit above)

Examples:
- "test papers" → Education
- "exam fees" → Education
- "notebook" → Education
- "pizza" → Food
- "netflix subscription" → Bills
- "gym membership" → Leisure

Respond with ONLY the category name, nothing else.`
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
        console.error('[AI Categorize] OpenAI API error:', aiError.message);
        // Fall through to rule-based categorization
      }
    }

    // Fallback: Rule-based categorization with comprehensive keywords
    const categoryKeywords = {
      Food: [
        'food', 'restaurant', 'grocery', 'cafe', 'lunch', 'dinner', 'breakfast', 'snack', 'meal',
        'pizza', 'burger', 'coffee', 'tea', 'jollibee', 'mcdo', 'market', 'bread', 'rice', 'chicken',
        'fastfood', 'buffet', 'dining', 'eat', 'drink', 'beverage', 'starbucks', 'grab food', 'food panda'
      ],
      Education: [
        'book', 'course', 'tuition', 'school', 'university', 'class', 'education', 'training', 'seminar', 'workshop',
        'udemy', 'coursera', 'test', 'exam', 'paper', 'papers', 'notebook', 'pen', 'pencil', 'study', 'learning',
        'textbook', 'workbook', 'thesis', 'project', 'assignment', 'homework', 'quiz', 'enrollment', 'fee',
        'supplies', 'materials', 'stationery', 'backpack', 'calculator', 'laptop for school', 'student'
      ],
      Clothing: [
        'clothes', 'shirt', 'pants', 'shoes', 'dress', 'jacket', 'fashion', 'apparel', 'nike', 'adidas',
        'uniqlo', 'h&m', 'shorts', 'jeans', 'socks', 'underwear', 'sneakers', 'sandals', 'bag', 'belt',
        'hat', 'cap', 'watch', 'accessory', 'jewelry', 'zara', 'forever 21'
      ],
      Housing: [
        'rent', 'mortgage', 'apartment', 'condo', 'house', 'furniture', 'repair', 'maintenance',
        'home depot', 'ikea', 'electricity deposit', 'lease', 'landlord', 'tenant', 'bed', 'chair',
        'table', 'cabinet', 'home improvement', 'paint', 'cleaning supplies for home'
      ],
      'Personal Needs': [
        'soap', 'shampoo', 'toothpaste', 'hygiene', 'personal care', 'grooming', 'haircut', 'salon',
        'barber', 'deodorant', 'perfume', 'lotion', 'razor', 'makeup', 'cosmetics', 'skincare',
        'facial', 'spa', 'manicure', 'pedicure', 'tissue', 'wipes'
      ],
      Healthcare: [
        'doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health', 'clinic', 'dentist',
        'vaccine', 'checkup', 'mercury drug', 'consultation', 'laboratory', 'xray', 'ultrasound',
        'surgery', 'treatment', 'prescription', 'vitamins', 'supplements', 'insurance', 'emergency'
      ],
      Leisure: [
        'movie', 'game', 'entertainment', 'concert', 'hobby', 'spotify', 'netflix', 'gaming', 'gym',
        'travel', 'vacation', 'cinema', 'youtube premium', 'disney+', 'hbo', 'playstation', 'xbox',
        'nintendo', 'fitness', 'workout', 'sports', 'recreation', 'swimming', 'hotel', 'resort', 'tour'
      ],
      Bills: [
        'electricity', 'water', 'internet', 'phone', 'bill', 'utility', 'cable', 'subscription',
        'meralco', 'pldt', 'globe', 'smart', 'converge', 'sky cable', 'wifi', 'postpaid', 'load',
        'mobile data', 'streaming', 'monthly payment'
      ],
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
    console.error('[AI Categorize] Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Server error during categorization' });
  }
}
