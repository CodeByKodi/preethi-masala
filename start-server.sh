#!/bin/bash

# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 1

# Start the server
echo "Starting server on http://localhost:8000"
npx http-server -p 8000

