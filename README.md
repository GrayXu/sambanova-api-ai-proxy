# sambanova-api-ai-proxy

Proxy to transfer Sambanova API to OpenAI compatible API.

 Configure `FAST_API_URL`, `PORT`, `MODEL_OVERRIDE`, and `AUTH_TOKEN` in proxy.js, then run the service directly.

```shell
npm install express axios body-parser
node server.js
```

So you can use the OpenAI style API to call `llama3-405b` (i.e., Llama3.1-405B).
```shell
curl http://localhost:11436/v1/chat/completions   -H "Content-Type: application/json"  -d '{
    "model": "llama3-405b",
    "messages": [
      {
        "role": "user",
        "content": "hello!"
      }
    ],
    "stream": true
  }'
```

related repo:
-  Sambanova Web to API: https://github.com/lingo34/sambanova-ai-proxy/