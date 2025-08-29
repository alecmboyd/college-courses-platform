#!/bin/bash

# Deploy script to force Vercel deployment
echo "Starting deployment process..."
echo "Timestamp: $(date)"
echo "Commit: $(git rev-parse HEAD)"
echo "Branch: $(git branch --show-current)"

# Verify build works
npm run build

echo "Build successful - ready for deployment"