# sambanova-api-ai-proxy

Proxy to transfer Sambanova API to OpenAI compatible API.

If you just want to act as a simple relay, just run the service.
For compatibility, the bearer token passed by the client is used internally as basic auth for the Sambanova API.

```shell
npm install express axios body-parser http-proxy-agent
node proxy.js
```

In addition, you can configure `FAST_API_URL`, `PORT`, `MODEL_OVERRIDE`, `HTTP_PROXY`, and `AUTH_TOKEN` in ENV to force specify parameters such as token(apikey) and models.
```shell
MODEL_OVERRIDE='llama3-405b' AUTH_TOKEN='XXXXXXXXXXXX' node proxy.js
```

Client request example:

```shell
curl https://localhost:11436/v1/models  # query models

curl https://localhost:11436/v1/chat/completions   -H "Content-Type: application/json"  -H "Authorization: Bearer XXXXXXX" -d '{
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

## cloudflare worker

Copy and paste the content of [cf-worker.js](https://github.com/GrayXu/sambanova-api-ai-proxy/blob/main/cf-worker.js) into your cloudflare worker and deploy. The Sambanova AI Proxy Server will be on your cloudflare worker as a serverless endpoint!

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