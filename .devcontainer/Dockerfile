FROM node:20-alpine

# Use Alpine for smaller image size and better security
# Install build dependencies for native packages and latest tools
RUN apk add --no-cache \
    git \
    openssh \
    bash \
    curl \
    python3 \
    make \
    g++ \
    linux-headers \
    openjdk11-jre \
    && npm install -g pnpm@10.22.0 firebase-tools@14.24.2 \
    && apk del make g++ linux-headers \
    && rm -rf /var/cache/apk/*

# Install GitHub CLI manually for Alpine
RUN curl -fsSL https://github.com/cli/cli/releases/download/v2.83.0/gh_2.83.0_linux_amd64.tar.gz \
    | tar -xz -C /tmp && \
    mv /tmp/gh_2.83.0_linux_amd64/bin/gh /usr/local/bin/ && \
    rm -rf /tmp/gh_2.83.0_linux_amd64

WORKDIR /workspaces

# Create node user properly for Alpine
RUN addgroup -g 1000 node || true \
    && adduser -u 1000 -G node -s /bin/bash -D node || true

USER node

CMD ["sleep", "infinity"]

