#!/bin/bash
git pull
cd svelte
pb/pocketbase serve &
sleep 1
if ! command -v bun &> /dev/null
then
    npm i
    npm run build
    npm run prod
else
    bun i
    bun run build
    bun run prod:bun
fi
