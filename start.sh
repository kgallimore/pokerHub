#!/bin/bash
cd svelte
if lsof -Pi :8090 -sTCP:LISTEN -t >/dev/null
then
    echo "Pocketbase is already running"
else
    pb/pocketbase serve &
fi



echo "Running server with pm2 node and hyper-express"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null
then
    echo "Reloading running server"
    npm run prod:restart &
else
    npm run prod &
fi

# if ! command -v bun &> /dev/null
# then

# else
#     if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null
#     then
#         echo "Killing running server"
#         fuser -k 3000/tcp
#     fi
#     echo "Running server with bun"
#     bun run prod:bun &
# fi
