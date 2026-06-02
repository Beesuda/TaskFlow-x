# ---- TaskFlow API: Node + Express + Prisma (SQLite) ----
FROM node:22-alpine AS base
WORKDIR /app

# OpenSSL is required by Prisma's query engine on Alpine.
RUN apk add --no-cache openssl

# Install dependencies (includes tsx, used to run TS directly).
COPY package.json package-lock.json* ./
RUN npm install

# Copy source + Prisma schema, then generate the client.
COPY . .
RUN npx prisma generate

# Persisted SQLite DB lives outside the app dir (volume-mounted in compose).
ENV DATABASE_URL="file:/data/dev.db"
EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
