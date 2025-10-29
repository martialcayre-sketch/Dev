# Cloud Run Dockerfile for API
FROM node:20-slim AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Use npm inside the container for simplicity
RUN npm ci || npm install

COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

EXPOSE 8080
ENV NODE_ENV=production
CMD ["npm", "start"]

