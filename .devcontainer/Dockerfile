FROM node:20-bullseye

# Install Java 21 (for future tools if needed)
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates && \
    echo "deb http://deb.debian.org/debian bookworm-backports main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y openjdk-21-jdk && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces

# Enable Corepack (pnpm)
RUN corepack enable

CMD ["sleep", "infinity"]

