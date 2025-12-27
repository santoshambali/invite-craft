#!/bin/sh
# Runtime environment variable injection script
# This script generates a JavaScript file with environment variables
# that can be loaded at runtime in the browser

set -e

# Create the public directory if it doesn't exist
mkdir -p /app/public

# Generate env-config.js with runtime environment variables
cat > /app/public/env-config.js << EOF
// Runtime Environment Configuration
// This file is generated at container startup with actual environment values
window.__ENV__ = {
  NEXT_PUBLIC_API_BASE_URL: "${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}",
  NEXT_PUBLIC_INVITATION_API_BASE_URL: "${NEXT_PUBLIC_INVITATION_API_BASE_URL:-}",
  NEXT_PUBLIC_APP_URL: "${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
};
EOF

echo "Environment configuration generated:"
cat /app/public/env-config.js

# Start the Next.js application
exec "$@"
