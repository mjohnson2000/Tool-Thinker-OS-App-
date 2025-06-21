export async function fetchChatGPT(prompt: string): Promise<any> {
  console.log('Prompt type:', typeof prompt, 'Prompt value:', prompt);
  console.log('Prompt being sent:', prompt);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chatgpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to fetch from backend ChatGPT proxy');
    }

    const data = await response.json();
    let parsed = null;
    try {
      parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
    } catch (err) {
      console.error('Failed to parse response:', err, data.message);
    }
    return parsed || data.message;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Fetch aborted due to timeout.');
      throw new Error('Request to AI timed out.');
    }
    throw error;
  }
}

export async function* fetchChatGPTStream(prompt: string): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/chatgpt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ prompt, stream: true })
  });
  if (!response.ok || !response.body) throw new Error('Failed to fetch from backend ChatGPT proxy');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let buffer = '';
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) yield line;
      }
    }
  }
  if (buffer.trim()) yield buffer;
}

