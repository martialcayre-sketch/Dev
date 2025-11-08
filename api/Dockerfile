# Cloud Run Dockerfile for API
FROM node:20-slim
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@9.15.9

# Copy package files
COPY package.json ./

# Install production dependencies
RUN pnpm install --prod

# Copy application source
COPY src ./src

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "src/server.js"]

