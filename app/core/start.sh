#!/bin/sh

echo "⏳ Waiting for DB..."
sleep 5

echo "🚀 Running migrations..."
alembic upgrade head

echo "🔥 Starting API..."
uvicorn app.main:app --host 0.0.0.0 --port 8000