#!/usr/bin/env bash

# EpiLog Instant Boot Script
set -e

# Ensure Homebrew and Node are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "  EpiLog: The AI Travel Journal & Intellectual Keepsake"
echo "  'A picture is worth a thousand words—let them write it for you.'"
echo "========================================================"

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing project dependencies..."
  npm install
fi

echo "🚀 Starting Next.js with Turbopack on http://localhost:3000 ..."
exec npm run dev
