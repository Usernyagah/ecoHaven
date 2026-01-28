#!/bin/sh
set -e

# Run migrations
npx prisma migrate deploy

# Start the application
node server.js
