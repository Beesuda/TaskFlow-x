#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
npx prisma migrate deploy

# Seed only when the database is empty, so restarts don't wipe real data.
USER_COUNT=$(npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.count().then(c => { console.log(c); return p.\$disconnect(); }).catch(() => { console.log(0); });" 2>/dev/null | tail -n1)

if [ "$USER_COUNT" = "0" ]; then
  echo "[entrypoint] Empty database detected — seeding demo data..."
  npm run seed
else
  echo "[entrypoint] Database already has $USER_COUNT users — skipping seed."
fi

echo "[entrypoint] Starting TaskFlow API..."
exec npx tsx src/index.ts
