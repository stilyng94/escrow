#!/usr/bin/env sh
set -ex

echo "create tables"
npm prototype
echo "tables created"

echo "Seeding database"
npm seed
echo "seeding success"

echo "start app"
node ./dist/main.js
exec "$@"
