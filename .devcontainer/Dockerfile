FROM node:20.18.0-alpine

# Use Alpine for smaller attack surface and reduced vulnerabilities
# Install required dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

WORKDIR /workspaces

# Install pnpm and firebase-tools globally
RUN npm install -g pnpm@9.15.9 firebase-tools

CMD ["sleep", "infinity"]

