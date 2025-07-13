import express from 'express';
import { z } from 'zod';
import { chatCompletion } from '../utils/openai';

const router = express.Router();

// Zod schemas for input validation
const PersonasSchema = z.object({
  businessIdea: z.string().min(5),
  customerDescription: z.string().min(5),
  numPersonas: z.number().min(1).max(5).default(3),
});

const FeedbackSchema = z.object({
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    summary: z.string(),
  })),
  stage: z.string(),
  businessIdea: z.string(),
  customerDescription: z.string(),
});

// POST /api/automated-discovery/personas
router.post('/personas', async (req, res) => {
  const parse = PersonasSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { businessIdea, customerDescription, numPersonas } = parse.data;

  try {
    const prompt = [
      { role: 'system', content: 'You are an expert business coach and customer researcher.' },
      { role: 'user', content: `Given the following business idea and customer description, generate ${numPersonas} diverse customer personas as a JSON array. Each persona should have: id, name, summary (1-2 sentences), and a short bio.\n\nBusiness Idea: ${businessIdea}\nCustomer Description: ${customerDescription}\n\nReturn ONLY the JSON array, no explanation.` },
    ];
    const aiResponse = await chatCompletion(prompt);
    // Try to parse the JSON from the AI response
    let personas = [];
    try {
      let clean = aiResponse || '';
      clean = clean.replace(/```json|```/gi, '').trim();
      personas = JSON.parse(clean);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI personas response', aiResponse });
    }
    // Add empty feedback array for each persona
    personas = personas.map((p: any, i: number) => ({
      ...p,
      id: typeof p.id === 'string' ? p.id : String(p.id ?? (i + 1)),
      feedback: []
    }));
    res.json({ personas });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

// POST /api/automated-discovery/feedback
router.post('/feedback', async (req, res) => {
  const parse = FeedbackSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { personas, stage, businessIdea, customerDescription } = parse.data;

  try {
    // Generate feedback for each persona
    const feedback = await Promise.all(personas.map(async (persona) => {
      const prompt = [
        { role: 'system', content: `You are acting as a customer persona for a business discovery process. Your persona: ${persona.name} - ${persona.summary}` },
        { role: 'user', content: `Given the business idea: "${businessIdea}" and customer description: "${customerDescription}", provide 2-3 bullet points of feedback for the stage: "${stage}". Be concise and realistic. Return ONLY a JSON array of bullet points.` },
      ];
      let feedbackArr: string[] = [];
      try {
        const aiResponse = await chatCompletion(prompt) || '';
        // Clean and parse the response as an array of bullet points
        let clean = aiResponse.replace(/```json|```/gi, '').trim();
        try {
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed)) {
            feedbackArr = parsed;
          } else if (typeof parsed === 'string') {
            // If it's a string, split by line breaks or bullet points
            feedbackArr = parsed.split(/\n|•|\-/).map(s => s.trim()).filter(Boolean);
          } else {
            feedbackArr = [clean];
          }
        } catch (e) {
          // If not JSON, split by line breaks or bullet points
          feedbackArr = clean.split(/\n|•|\-/).map(s => s.trim()).filter(Boolean);
        }
      } catch (e) {
        feedbackArr = ['Could not generate feedback.'];
      }
      return { personaId: persona.id, feedback: feedbackArr };
    }));

    // Generate collective summary
    const summaryPrompt = [
      { role: 'system', content: 'You are an expert business coach.' },
      { role: 'user', content: `Given the following business idea: "${businessIdea}", customer description: "${customerDescription}", and the following customer personas: ${personas.map(p => `${p.name} - ${p.summary}`).join('; ')}. For the stage: "${stage}", summarize the main feedback themes in 2-3 sentences. Be concise and actionable.` },
    ];
    let summary = '';
    try {
      summary = await chatCompletion(summaryPrompt) || '';
    } catch (e) {
      summary = 'Could not generate summary.';
    }

    res.json({ feedback, summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

export default router; 