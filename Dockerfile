FROM node:18.13 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:21-alpine
WORKDIR /app
COPY --from=builder /app/dist/road-api /app

EXPOSE 4000

CMD ["node", "server/server.mjs"]
