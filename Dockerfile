# Build context: repo root. Builds node-server (backend API).
FROM node:20-alpine

WORKDIR /app

COPY node-server/package*.json ./
COPY node-server/prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY node-server/tsconfig.json ./
COPY node-server/src ./src/

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]
