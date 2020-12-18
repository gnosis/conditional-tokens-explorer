#!/bin/bash

set -e # exit when any command fails

waitport() {
    while ! nc -z $1 $2 ; do sleep 1 ; done
}

ganache-cli -d -i 50 &
PID=$!

## Create Omen Subgraph

cd omen-subgraph/

waitport localhost 8545

echo "Run migrate"
npm run migrate
echo "Apply codegen"
npm run codegen

waitport graph-node 8000

echo "Creating gnosis/hg at http://graph-node:8020"
./node_modules/.bin/graph create --node http://graph-node:8020 protofire/omen

echo "Deploying gnosis/hg at local"
./node_modules/.bin/graph deploy --node http://graph-node:8020 --ipfs http://ipfs:5001 protofire/omen

kill $PID