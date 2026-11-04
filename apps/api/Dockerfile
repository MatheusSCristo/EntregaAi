FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --include=optional
COPY apps/api apps/api
RUN npm run db:generate && npm --workspace api run build
USER node
EXPOSE 3000
CMD ["sh", "-c", "cd apps/api && node scripts/prisma.js migrate deploy && npm run db:seed && node dist/main.js"]
