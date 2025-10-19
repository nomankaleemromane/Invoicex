// Vercel Serverless Function: /api/analysis
// Receives POST { analysisData } and forwards a crafted prompt to OpenAI, returning parsed JSON analysis
// Uses global fetch provided by the runtime (Node 18+ / Vercel)

function buildPrompt(analysisData) {
  return `Analyze this invoice financing investment opportunity and return a JSON response with this exact structure:

{
    "score": 8,
    "recommendation": "Strong Buy",
    "riskFactors": ["Factor 1", "Factor 2", "Factor 3"],
    "strengths": ["Strength 1", "Strength 2"],
    "marketInsights": "Brief market analysis",
    "detailedAnalysis": "Comprehensive professional analysis"
}

Investment Data:
- Pool: ${analysisData.pool.businessName}
- Company: ${analysisData.pool.companyName}
- Total Invoice Value: AED ${analysisData.pool.totalInvoiceValue}
- Discount Rate: ${analysisData.pool.avgDiscountRate}%
- Risk Score: ${analysisData.pool.riskScore}/100
- Repayment Period: ${analysisData.pool.avgRepaymentDays} days
- Available Shares: ${analysisData.pool.availableShares}
- Share Price: AED ${analysisData.pool.sharePrice}

Business Profile:
- Industry: ${analysisData.business.industry}
- Business Type: ${analysisData.business.businessType}
- Monthly Invoicing: AED ${analysisData.business.monthlyInvoicing}
- Years in Business: ${analysisData.business.yearsInBusiness}
- Verification: ${analysisData.business.verificationLevel}

Invoice Details:
${analysisData.invoices.map(inv => `- ${inv.buyerName}: AED ${inv.amount}, Due: ${inv.dueDate}`).join('\n')}

Investor Profile:
- Risk Level: ${analysisData.investorProfile.riskLevel}
- Investment Range: ${analysisData.investorProfile.investmentRange}

Provide professional financial analysis.`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const analysisData = body.analysisData;
  if (!analysisData) return res.status(400).json({ error: 'Missing analysisData in request body' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured on server' });

  try {
    const prompt = buildPrompt(analysisData);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional financial analyst specializing in invoice financing investments. Provide concise, professional analysis with specific numerical scores and actionable insights. Return ONLY a JSON object as specified.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'OpenAI API error', details: text });
    }

    const data = await response.json();
    const content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';

    // Try to extract JSON from content
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (e2) { parsed = null; }
      }
    }

    if (!parsed) {
      return res.status(200).json({ error: 'Unable to parse analysis JSON', raw: content });
    }

    return res.status(200).json({ analysis: parsed });
  } catch (err) {
    console.error('Analysis endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
