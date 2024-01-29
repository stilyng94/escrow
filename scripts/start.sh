#!/usr/bin/env sh
set -ex

echo "migrate for deployment"
npm migrate:deploy
echo "migration success"

echo "start app"
node ./dist/main.js
exec "$@"
