#!/bin/bash

echo "🚀 Pushing VoidSEO to GitHub..."

# Kill any vim processes that might be running
pkill -f vim 2>/dev/null || true

# Reset any pending git operations
git reset --hard HEAD 2>/dev/null || true

# Configure git to avoid vim editor
export GIT_EDITOR="echo"
git config --global core.editor "echo"

# Force push to GitHub
echo "📤 Force pushing to GitHub..."
git push origin main --force

echo "✅ Done! Your site should now be on GitHub at https://github.com/MarcW88/VoidSEO"
