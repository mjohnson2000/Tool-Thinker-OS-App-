export async function fetchChatGPT(prompt: string): Promise<string> {
  const response = await fetch('/api/chatgpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error('Failed to fetch from backend ChatGPT proxy');
  const data = await response.json();
  return data.content;
}

export async function* fetchChatGPTStream(prompt: string): AsyncGenerator<string, void, unknown> {
  const response = await fetch('/api/chatgpt', {
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