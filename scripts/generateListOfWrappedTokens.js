const { ethers } = require('ethers')
const { schema } = require('@uniswap/token-lists')
const Ajv = require('ajv')
const moment = require('moment')
const gql = require('graphql-tag')
const { ApolloClient } = require("apollo-client")
const fetch = require("node-fetch")
const { HttpLink } = require('apollo-link-http')
const { InMemoryCache } = require('apollo-cache-inmemory')
const fs = require('fs')

const [ network ] = process.argv.slice(2)
if(!network) {
  console.log(`You should pass the network id as a parameter, should be rinkeby or mainnet`)
  process.exit(1)
}

const [ infuraId ] = process.argv.slice(3)
if(!infuraId) {
  console.log(`You should pass the infuraId`)
  process.exit(1)
}

let httpUri = 'https://api.thegraph.com/subgraphs/name/cag/hg'
let networkId = 1
if( network === 'rinkeby') {
  httpUri = 'https://api.thegraph.com/subgraphs/name/cag/hg-rinkeby'
  networkId = 4
}

const CTEHttpLink = new HttpLink({
  uri: httpUri,
  fetch: fetch
})

const client = new ApolloClient({
  link: CTEHttpLink,
  cache: new InMemoryCache()
});

const GetAllPositionsQuery = gql`
  query GetAllPositions($first: Int!, $skip: Int!) {
    positions(first: $first, skip: $skip, orderBy: createTimestamp, orderDirection: desc) {
      id
      createTimestamp
      collateralToken {
        id
      }
      wrappedToken {
        id
      }
    }
  }
`

const provider = new ethers.providers.InfuraProvider(networkId, infuraId)

const fetchTokens = async () => {
  const step = 200
  let skip = 0
  let partialData = []

  while (true) {
    try {
      const { data: lastFetched } = await client.query({
        query: GetAllPositionsQuery,
        variables: { first: step, skip },
      })

      skip = skip + step

      if ((lastFetched && lastFetched['positions'].length === 0) || !lastFetched) {
        break
      } else {
        partialData = [...partialData, ...lastFetched['positions']]
      }

    } catch (e) {
      break
    }
  }

  return partialData.filter(data => data.wrappedToken).map(data => data.wrappedToken.id)
}

const generateMyTokenList = async () => {
  const actualDate = moment(new Date()).format()
  const tokens = await fetchTokens()

  const tokensPromise = tokens.map(async(tokenAddress) => {
    const erc20abi = [
      'function symbol() external view returns (string)',
      'function name() external view returns (string)',
      'function decimals() external view returns (uint8)',
    ]
    const contract = new ethers.Contract(tokenAddress, erc20abi, provider)
    const decimals = await contract.decimals()
    const symbol = await contract.symbol()
    const name = await contract.name()

    return {
      chainId: networkId,
      address: tokenAddress,
      symbol,
      name,
      decimals,
      tags: [],
    }
  })

  const tokensResolved = await Promise.all(tokensPromise)

  return {
    name: 'Conditional Tokens',
    logoURI: 'ipfs://Qmd2xn6yykqsZYe1pKvUpcdVD2WmP75dNDWqodvf6h2SGH',
    keywords: [
      "conditional tokens",
      "gnosis",
      "prediction markets",
    ],
    tags: {},
    timestamp: actualDate,
    version: {
      major: 1,
      minor: 0,
      patch: 0,
    },
    tokens: tokensResolved,
  }
}

const tokenListValidator = new Ajv({ allErrors: true }).compile(schema)

const fetchAndValidateTokens = async () => {
  const json = await generateMyTokenList()
  if (tokenListValidator(json)) {
    return json
  }
  return []
}

(async () => {
  let myList = await fetchAndValidateTokens()
  let data = JSON.stringify(myList, null, 4)
  fs.writeFileSync(`conditional_token_lists/conditional-token-list-chain-${networkId}.json`, data)
})().catch(e => {
  // Do nothing
})


