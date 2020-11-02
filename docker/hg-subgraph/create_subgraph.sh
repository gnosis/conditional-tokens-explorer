#!/bin/bash

set -e # exit when any command fails

waitport() {
    while ! nc -z $1 $2 ; do sleep 1 ; done
}

ganache-cli -d -i 50 &
PID=$!

cd hg-subgraph/
#sed -i 's/localhost/ganache/g' ops/render-subgraph-conf.js
#sed -i 's/localhost/ganache/g' node_modules/@gnosis.pm/conditional-tokens-contracts/truffle.js

waitport localhost 8545

echo "Run migrate"
npm run migrate
echo "Run render subgraph"
npm run refresh-abi && npm run render-subgraph-config-local
echo "Setup the right CT address"
sed -i -E "s/(address: '0x[a-zA-Z0-9]+')/address: '0xA57B8a5584442B467b4689F1144D269d096A3daF'/g" subgraph.yaml
echo "Apply codegen"
./node_modules/.bin/graph codegen

waitport graph-node 8000

echo "Creating gnosis/hg at http://graph-node:8020"
./node_modules/.bin/graph create --node http://graph-node:8020 gnosis/hg

echo "Deploying gnosis/hg at local"
./node_modules/.bin/graph deploy --node http://graph-node:8020 --ipfs http://ipfs:5001 gnosis/hg

kill $PID