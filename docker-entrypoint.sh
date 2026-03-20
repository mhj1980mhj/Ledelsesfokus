#!/bin/sh
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="postgresql://${APP_DB_USER:-boligoverblik}:${APP_DB_PASSWORD:-boligoverblik_local}@${APP_DB_HOST:-postgres}:${APP_DB_PORT:-5432}/${APP_DB_NAME:-boligoverblik}"
fi

npm run db:push -- --force
exec npm start
