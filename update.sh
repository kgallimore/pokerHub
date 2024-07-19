#!/bin/bash
git pull
cd svelte
if ! command -v bun &> /dev/null
then
    npm i
    npm run build
else
    bun i
    bun run build
fi
exit 1
