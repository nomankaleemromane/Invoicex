// Vercel Serverless Function: /api/chat
// Receives POST { message, context } and forwards to OpenAI Chat Completions API
// Expects environment variable OPENAI_API_KEY to be set in Vercel project settings
// Uses global fetch provided by the runtime (Node 18+ / Vercel)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, context } = req.body || {};
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing "message" in request body' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OpenAI API key not configured on server' });
    return;
  }

  try {
    const systemPrompt = context && context.length > 0 ? context : 'You are InvoiceX AI assistant that helps analyze invoice-backed investment pools.';

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 800
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: 'OpenAI API error', details: text });
      return;
    }

    const data = await response.json();
    const assistant = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';

    res.status(200).json({ reply: assistant });
  } catch (err) {
    console.error('Error calling OpenAI:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
