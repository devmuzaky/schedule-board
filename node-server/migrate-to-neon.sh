#!/bin/bash
# Migrate local tasks to Neon (deployed database)
#
# 1. Get your Neon connection string from https://console.neon.tech
#    → Select your project → Connection string → Copy (use "Pooled connection")
#
# 2. Run this script with your URL:
#    TARGET_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" ./migrate-to-neon.sh
#
# Or export first:
#    export TARGET_DATABASE_URL="postgresql://..."
#    ./migrate-to-neon.sh

set -e
cd "$(dirname "$0")"

SOURCE_DATABASE_URL="${SOURCE_DATABASE_URL:-postgresql://schedule:schedule@localhost:5432/schedule_db}"

if [ -z "$TARGET_DATABASE_URL" ]; then
  echo "Error: TARGET_DATABASE_URL is required."
  echo ""
  echo "Get it from https://console.neon.tech → your project → Connection string"
  echo ""
  echo "Then run:"
  echo '  TARGET_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" ./migrate-to-neon.sh'
  exit 1
fi

echo "Source: $SOURCE_DATABASE_URL"
echo "Target: ${TARGET_DATABASE_URL:0:50}..."
echo ""

SOURCE_DATABASE_URL="$SOURCE_DATABASE_URL" \
TARGET_DATABASE_URL="$TARGET_DATABASE_URL" \
npm run migrate-to-neon
