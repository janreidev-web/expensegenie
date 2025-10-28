// Quick test endpoint to verify Gemini API key
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Check which keys are available
  const status = {
    geminiConfigured: !!geminiKey,
    openaiConfigured: !!openaiKey,
    geminiKeyLength: geminiKey ? geminiKey.length : 0,
    openaiKeyLength: openaiKey ? openaiKey.length : 0,
  };

  // Try a simple Gemini API call if key exists
  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello, Gemini is working!" in JSON format: {"message": "your message here"}'
            }]
          }],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        status.geminiTest = 'SUCCESS';
        status.geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text';
      } else {
        status.geminiTest = 'FAILED';
        status.geminiError = data.error?.message || JSON.stringify(data);
      }
    } catch (error) {
      status.geminiTest = 'ERROR';
      status.geminiError = error.message;
    }
  }

  return res.status(200).json(status);
}
