#!/bin/sh
set -e

# Run migrations (optional, can also be done via preDeployCommand)
# npx prisma migrate deploy

# Start the application
node server.js
