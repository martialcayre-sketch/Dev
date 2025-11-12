# Multi-stage build pour optimiser les layers et le cache
FROM node:24.11.1-bookworm

# Versions fixées pour reproductibilité
ENV PNPM_VERSION=10.22.0 \
    FIREBASE_TOOLS_VERSION=14.24.2

# Dépendances système (Debian/Bookworm) compatibles avec les Features Codespaces (apt-get)
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       git \
       openssh-client \
       bash \
       curl \
       bc \
       jq \
       ca-certificates \
       python3 \
       build-essential \
       default-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Outils globaux avec versions fixes (inclut corepack)
RUN npm install -g pnpm@${PNPM_VERSION} firebase-tools@${FIREBASE_TOOLS_VERSION} corepack@0.34.3 \
    && corepack --version

WORKDIR /workspaces

# Crée l'utilisateur node si nécessaire (IDs stables)
RUN id -u node >/dev/null 2>&1 || useradd -m -u 1000 -s /bin/bash node || true

# Healthcheck basique (gh est installé via Feature Codespaces côté Debian)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node --version && pnpm --version || exit 1

USER node

CMD ["sleep", "infinity"]
