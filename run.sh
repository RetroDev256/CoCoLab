# Just in case it crashes, restart it after 5 seconds

cd src
while true; do
    bun run server.js
    echo "Server crashed... Restarting..."
    sleep 5
done
