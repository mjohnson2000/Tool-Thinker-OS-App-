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

router.post('/', async (req, res, next) => {
  console.log('Received /api/chatgpt request', req.body);
  try {
    const { prompt } = chatSchema.parse(req.body);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new AppError(500, 'OpenAI API key not configured');

    const response = await axios.post<OpenAIChatResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const message = response.data.choices?.[0]?.message?.content || '';
    res.json({ status: 'success', message });
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('ChatGPT route error: OpenAI API responded with error', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('ChatGPT route error: No response from OpenAI API', error.request);
    } else {
      // Something happened in setting up the request
      console.error('ChatGPT route error: General error', error.message);
    }
    next(error);
  }
});

export { router as chatgptRouter }; 