# sambanova-api-ai-proxy

Proxy to transfer Sambanova API to OpenAI compatible API.

Configure `FAST_API_URL`, `PORT`, `MODEL_OVERRIDE`, `HTTP_PROXY`, and `AUTH_TOKEN` in ENV, and run the service.

MODEL_OVERRIDE is used to enforce a specific model type, such as `llama3-405b`.

example to run service:  
```shell
npm install express axios body-parser http-proxy-agent
AUTH_TOKEN='XXXXXXXXXXXX' node proxy.js
```

So that you can use the OpenAI compatible API to call `llama3-405b` (i.e., Llama3.1-405B).
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

## docker

```shell
# build docker image
docker build -t sambanova-api-ai-proxy
# run docker
docker run --net=host -e PORT=11436 -e AUTH_TOKEN='XXXXXXXXXXXX' sambanova-api-ai-proxy
# docker run --net=host -e PORT=11436 -e HTTP_PROXY=http://127.0.0.1:7890 -e AUTH_TOKEN='XXXXXXXXXXXX' sambanova-api-ai-proxy   # if with http proxy
```

## related repo
-  Sambanova Web to API: https://github.com/lingo34/sambanova-ai-proxy/