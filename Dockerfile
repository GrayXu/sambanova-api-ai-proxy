FROM node:16 AS builder

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

FROM node:16

WORKDIR /app
COPY --from=builder /app/ .

# run service
CMD ["node", "proxy.js"]