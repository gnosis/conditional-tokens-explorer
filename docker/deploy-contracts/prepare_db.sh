#!/bin/sh

set -e # exit when any command fails

# deploy realitio contracts
cd realitio/truffle
sed -i 's/localhost/ganache/g' truffle.js
../node_modules/.bin/truffle deploy --network development
export REALITIO_ADDRESS=$(jq -r '.networks["50"].address' build/contracts/Realitio.json)
cd -

# deploy mock tokens
MOCK_CDAI_ADDRESS=$(eth contract:deploy --network http://ganache:8545 --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["CDAI", 8]' ERC20.bin | jq -r .address)
MOCK_DAI_ADDRESS=$(eth contract:deploy --network http://ganache:8545 --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["DAI", 18]' ERC20.bin | jq -r .address)
MOCK_USDC_ADDRESS=$(eth contract:deploy --network http://ganache:8545 --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["USDC", 6]' ERC20.bin | jq -r .address)
MOCK_OWL_ADDRESS=$(eth contract:deploy --network http://ganache:8545 --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["OWL", 18]' ERC20.bin | jq -r .address)
MOCK_WETH_ADDRESS=$(eth contract:deploy --network http://ganache:8545 --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["WETH", 18]' ERC20.bin | jq -r .address)
MOCK_CHAI_ADDRESS=$(eth contract:deploy --network http://ganache:8545 --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["CHAI", 18]' ERC20.bin | jq -r .address)

# deploy conditional tokens contracts
cd conditional-tokens-contracts
sed -i 's/localhost/ganache/g' truffle.js
npm run migrate -- --network local
export CONDITIONAL_TOKENS_ADDRESS=$(jq -r '.networks["50"].address' build/contracts/ConditionalTokens.json)
cd -

# deploy realitio proxy
cd realitio-gnosis-proxy
sed -i 's/127.0.0.1/ganache/g' truffle-config.js
./node_modules/.bin/truffle migrate --network development
REALITIO_PROXY_ADDRESS=$(jq -r '.networks["50"].address' build/contracts/RealitioProxy.json)
cd -

# save contracts addresses
echo "Main contracts:" >> contracts_addresses.txt
echo "realitio: ${REALITIO_ADDRESS}" >> contracts_addresses.txt
echo "conditional tokens: ${CONDITIONAL_TOKENS_ADDRESS}" >> contracts_addresses.txt
echo "oracle: ${REALITIO_PROXY_ADDRESS}" >> contracts_addresses.txt
echo "" >> contracts_addresses.txt
echo "Tokens:" >> contracts_addresses.txt
echo "mock cdai: ${MOCK_CDAI_ADDRESS}" >> contracts_addresses.txt
echo "mock dai: ${MOCK_DAI_ADDRESS}" >> contracts_addresses.txt
echo "mock usdc: ${MOCK_USDC_ADDRESS}" >> contracts_addresses.txt
echo "mock owl: ${MOCK_OWL_ADDRESS}" >> contracts_addresses.txt
echo "mock weth: ${MOCK_WETH_ADDRESS}" >> contracts_addresses.txt
echo "mock chai: ${MOCK_CHAI_ADDRESS}" >> contracts_addresses.txt

cat contracts_addresses.txt