FROM node:20-slim
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN npm ci || npm install

# Copy source
COPY . .

# Build Next app
RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["npm","start","--","-p","8080"]

