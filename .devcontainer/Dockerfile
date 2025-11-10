FROM node:20.18.0-bookworm-slim

# NOTE: Corepack a des problèmes de signature de clés avec certaines versions.
# On installe pnpm et firebase-tools directement via npm pour plus de robustesse.
# Utilisation de bookworm-slim (Debian 12) pour réduire les vulnérabilités.

WORKDIR /workspaces

# Installer pnpm et firebase-tools globalement
RUN npm install -g pnpm@9.15.9 firebase-tools

CMD ["sleep", "infinity"]

