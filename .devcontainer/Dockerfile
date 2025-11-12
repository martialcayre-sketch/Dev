FROM node:20-alpine

# Use Alpine for smaller image size and better security
# Install build dependencies for native packages
RUN apk add --no-cache \
    git \
    openssh \
    bash \
    curl \
    python3 \
    make \
    g++ \
    linux-headers \
    && npm install -g pnpm@9.15.9 firebase-tools@14.24.2 \
    && apk del make g++ linux-headers \
    && rm -rf /var/cache/apk/*

WORKDIR /workspaces

# Create node user with proper permissions
RUN addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/bash -D node
USER node

CMD ["sleep", "infinity"]

