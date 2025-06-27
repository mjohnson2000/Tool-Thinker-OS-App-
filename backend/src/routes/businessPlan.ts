import { Router, Request, Response } from 'express';
import axios from 'axios';

export const businessPlanRouter = Router();

businessPlanRouter.post('/discovery', async (req: Request, res: Response) => {
  console.log('Received /api/business-plan/discovery request', req.body);
  const { idea, customer, job } = req.body;
  if (!idea || !customer || !job) {
    return res.status(400).json({ error: 'Missing required fields: idea, customer, job' });
  }

  const prompt = `
You are a business strategist AI. Given:
- Interests: ${idea.interests}
- Customer Persona: ${customer.title} (${customer.description})
- Customer Job: ${job.title} (${job.description})

Generate a concise business plan with:
- A 2-3 sentence summary
- 3-5 sections: Market, Customer Job, Product, Go-to-Market, and one more relevant section.
- Each section should be 2-3 sentences, clear and actionable.
Return as JSON: { summary: string, sections: { [section: string]: string } }
No extra text, just valid JSON.
  `.trim();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured' });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = (response.data as any).choices?.[0]?.message?.content?.trim() || '';
    let plan;
    try {
      console.log('Prompt:', prompt);
      console.log('OpenAI raw response:', content);
      plan = JSON.parse(content);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content });
    }

    res.json(plan);
  } catch (error: any) {
    console.error('OpenAI error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate business plan', details: error.message });
  }
}); 

