#!/bin/bash

# Start local development environment

set -e

echo "Starting PostgreSQL database with Docker..."
docker compose up -d

echo "Waiting for database to be ready..."
# Wait for database to be healthy
while ! docker compose exec -T postgres pg_isready -U postgres -d ai_taskflow; do
  echo "Waiting for database..."
  sleep 2
done

echo "Database is ready!"
echo "Running database migrations..."
npm run db:migrate

echo "Starting Next.js development server..."
npm run dev

echo "Local development environment started!"
echo "Database: postgresql://postgres:postgres@localhost:5432/ai_taskflow"
echo "Application: http://localhost:3000"