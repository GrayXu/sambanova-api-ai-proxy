addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
  
    if (url.pathname === '/v1/chat/completions') {
        return handleChatCompletions(request);
    } else if (url.pathname === '/v1/models') {
        return handleModels();
    } else {
        return new Response('Not Found', { status: 404 });
    }
  }
  
  async function handleChatCompletions(request) {
    const apiUrl = 'https://fast-api.snova.ai/v1/chat/completions';
  
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }
  
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }
  
    const apiKey = authHeader.split('Bearer ')[1];
  
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (error) {
        return new Response('Invalid JSON format', { status: 400 });
    }
  
    if (!requestBody.model || !requestBody.messages || !Array.isArray(requestBody.messages)) {
        return new Response('Missing required fields: model and messages', { status: 400 });
    }
  
    requestBody.stream = true;
  
    const init = {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
  
    try {
        const response = await fetch(apiUrl, init);
  
        if (!response.ok) {
            const errorText = await response.text();
            return new Response(`Error from API: ${response.statusText} - ${errorText}`, { status: response.status });
        }
  
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
  
        let buffer = '';
  
        const processStream = async ({ done, value }) => {
            if (done) {
                if (buffer.trim()) {
                    console.log('Remaining buffer:', buffer);
                }
                await writer.close();
                return;
            }
  
            buffer += decoder.decode(value, { stream: true });
  
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
  
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith(':')) {
                    try {
                        let jsonStr = trimmedLine;
                        if (trimmedLine.startsWith('data: ')) {
                            jsonStr = trimmedLine.slice(6);
                        }
                        if (jsonStr === '[DONE]') continue;
  
                        const jsonObj = JSON.parse(jsonStr);
                        await writer.write(new TextEncoder().encode(JSON.stringify(jsonObj) + '\n'));
                    } catch (e) {
                        console.error('Error processing line:', trimmedLine);
                        console.error('Parse error:', e);
                    }
                }
            }
  
            return reader.read().then(processStream);
        };
  
        reader.read().then(processStream);
  
        return new Response(readable, {
            headers: {
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked'
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
  }
  
  function handleModels() {
    const modelsResponse = JSON.stringify({
        "object": "list",
        "data": [
            {
                "id": "llama3-405b",
                "object": "model",
                "created": 1686935002,
                "owned_by": "sambanova-ai"
            },
            {
                "id": "Meta-Llama-3.1-405B-Instruct",
                "object": "model",
                "created": 1686935002,
                "owned_by": "sambanova-ai",
            },
            {
                "id": "Meta-Llama-3.1-70B-Instruct",
                "object": "model",
                "created": 1686935002,
                "owned_by": "sambanova-ai",
            },
            {
                "id": "Meta-Llama-3.1-8B-Instruct",
                "object": "model",
                "created": 1686935002,
                "owned_by": "sambanova-ai",
            },
        ],
    });
  
    return new Response(modelsResponse, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
  }