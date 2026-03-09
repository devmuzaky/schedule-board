# Build context: repo root. Builds node-server (backend API).
# Use Debian slim (not Alpine) - Prisma has OpenSSL issues on Alpine 3.21
FROM node:20-slim

WORKDIR /app

# Prisma requires OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY node-server/package*.json ./
COPY node-server/prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY node-server/tsconfig.json ./
COPY node-server/src ./src/

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
