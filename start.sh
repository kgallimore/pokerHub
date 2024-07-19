#!/bin/bash
cd svelte
if lsof -Pi :8090 -sTCP:LISTEN -t >/dev/null
then
    echo "Pocketbase is already running"
else
    pb/pocketbase serve &
fi

if ! command -v bun &> /dev/null
then
    echo "Running server with node and hyper-express"
    npm run prod
else
    echo "Running server bun"
    bun run build
fi
