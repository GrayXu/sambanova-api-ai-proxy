const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

const FAST_API_URL = process.env.FAST_API_URL || 'https://fast-api.snova.ai/v1/chat/completions';
const PORT = process.env.PORT || 11436;
const MODEL_OVERRIDE = process.env.MODEL_OVERRIDE || '';
const HTTP_PROXY = process.env.HTTP_PROXY;

app.use(bodyParser.json());

function sendErrorResponse(res, status, response) {
    let cleanResponse;
    try {
        cleanResponse = JSON.parse(JSON.stringify(response)); // Attempt to stringify to remove circular refs
    } catch (err) {
        const util = require('util');
        cleanResponse = util.inspect(err); // Fallback to util.inspect to handle circular refs
    }
    res.status(status).json({ message: 'Internal Server Error', detail: cleanResponse });
}

app.post('/v1/chat/completions', (req, res) => {
  let body = req.body;

  if (MODEL_OVERRIDE && MODEL_OVERRIDE.trim() !== '') {
    body.model = MODEL_OVERRIDE;
  }

  // Get the AUTH_TOKEN from environment or client's bearer token
  const authToken = process.env.AUTH_TOKEN || (req.headers['authorization'] && req.headers['authorization'].replace(/^bearer /i, ''));

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized: No AUTH_TOKEN provided' });
  } else {
    console.log('Auth Token:', authToken);
  }

  const modifiedPayload = {
    ...body,
    stop: ["<|eot_id|>"]
  };

  const axiosOptions = {
    responseType: 'stream',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + authToken
    },
  };

  if (HTTP_PROXY) {
    axiosOptions.proxy = {
      host: new URL(HTTP_PROXY).hostname,
      port: new URL(HTTP_PROXY).port,
      protocol: new URL(HTTP_PROXY).protocol,
    };
  }

  const axiosInstance = axios.create(axiosOptions);

  axiosInstance.post(FAST_API_URL, modifiedPayload)
  .then(response => {
      res.setHeader('Content-Type', response.headers['content-type']);
      res.setHeader('Transfer-Encoding', response.headers['transfer-encoding']);
      response.data.pipe(res);
  })
  .catch(error => {
      console.error('Error with forwarding request:', error.message);
      const status = error.response ? error.response.status : 500;
      let response = { message: 'Internal Server Error' };

      if (error.response && error.response.data) {
          response = error.response.data;
      } else if (error.request) {
          response = { message: 'No response received from upstream server' };
      }

      sendErrorResponse(res, status, response);
  });
});

app.get('/v1/models', (req, res) => {
  const modelsResponse = {
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
  };
  res.json(modelsResponse);
});

app.listen(PORT, () => {
  if (process.env.AUTH_TOKEN) {
    console.log(`Using AUTH_TOKEN from environment`);
  } else {
    console.log(`No AUTH_TOKEN found in environment. Will use client-provided bearer token.`);
  } 
  console.log(`Server is listening on port ${PORT}`);
  console.log(`FAST_API_URL: ${FAST_API_URL}`);
  console.log(`Model override: ${MODEL_OVERRIDE || 'Not set'}`);
});