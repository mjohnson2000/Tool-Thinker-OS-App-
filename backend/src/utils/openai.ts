import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(messages: any[], model = 'gpt-3.5-turbo', temperature = 0.7) {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
  });
  return response.choices[0].message?.content;
} 