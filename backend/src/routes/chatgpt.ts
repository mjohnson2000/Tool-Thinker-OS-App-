import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const chatSchema = z.object({
  prompt: z.string().min(1)
});

interface OpenAIChatResponse {
  choices: { message: { content: string } }[];
}

router.post('/', async (req, res) => {
  console.log('Received /api/chatgpt request', req.body);
  try {
    const { prompt } = chatSchema.parse(req.body);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await axios.post<OpenAIChatResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const message = response.data.choices?.[0]?.message?.content || '';
    let parsed = null;
    
    // First, try to parse the entire message as JSON
    try {
      parsed = JSON.parse(message);
      console.log('Successfully parsed JSON response:', parsed);
    } catch (err) {
      console.log('Failed to parse as JSON, trying to extract JSON array...');
      
      // Try to extract JSON array from the response
      try {
        // Look for JSON array pattern more specifically
        const jsonArrayMatch = message.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (jsonArrayMatch) {
          parsed = JSON.parse(jsonArrayMatch[0]);
          console.log('Extracted JSON array from OpenAI response:', jsonArrayMatch[0]);
        } else {
          // If no JSON found, return the original message
          console.log('No JSON array found in response, returning original message');
          parsed = message;
        }
      } catch (extractErr) {
        console.error('Failed to extract JSON from OpenAI response:', extractErr);
        console.log('Original message:', message);
        parsed = message;
      }
    }
    res.json({ status: 'success', message: parsed });
  } catch (error: any) {
    let errorMsg = 'Unknown error';
    if (error.response) {
      console.error('ChatGPT route error: OpenAI API responded with error', {
        status: error.response.status,
        data: error.response.data,
      });
      errorMsg = error.response.data?.error?.message || error.response.statusText || 'OpenAI API error';
    } else if (error.request) {
      console.error('ChatGPT route error: No response from OpenAI API', error.request);
      errorMsg = 'No response from OpenAI API';
    } else if (error.message) {
      console.error('ChatGPT route error: General error', error.message);
      errorMsg = error.message;
    }
    res.status(500).json({ status: 'error', error: errorMsg });
  }
});

export { router as chatgptRouter }; 