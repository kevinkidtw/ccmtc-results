#!/bin/sh

# Initialize the SQLite database if it doesn't exist
if [ ! -f /app/data/dev.db ]; then
  echo "[init] Database not found, creating from template..."
  cp /app/dev.db.template /app/data/dev.db
  echo "[init] Database initialized successfully."
fi

echo "[start] Running database migrations..."
if [ -f /app/migrate.js ]; then
  node /app/migrate.js
else
  echo "[warning] migrate.js not found!"
fi

echo "[start] Starting Next.js server..."
exec node server.js
