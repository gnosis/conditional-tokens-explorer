import {
  EARLIEST_MAINNET_BLOCK_TO_CHECK,
  EARLIEST_RINKEBY_BLOCK_TO_CHECK,
  GRAPH_HTTP_MAINNET,
  GRAPH_HTTP_RINKEBY,
  GRAPH_WS_MAINNET,
  GRAPH_WS_RINKEBY,
} from './constants'

export type NetworkId = 1 | 4

const networkIds = {
  MAINNET: 1,
  RINKEBY: 4,
} as const

export type Token = {
  symbol: string
  address: string
  decimals: number
}

interface Network {
  earliestBlockToCheck: number
  contracts: {
    conditionalTokensAddress: string
    realitioAddress: string
  }
  tokens: Token[]
  graphHttpUri: string
  graphWsUri: string
}

const networks: { [K in NetworkId]: Network } = {
  [networkIds.MAINNET]: {
    earliestBlockToCheck: EARLIEST_MAINNET_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
      realitioAddress: '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47',
    },
    tokens: [
      {
        symbol: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        decimals: 18,
      },
      {
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
      },
    ],
    graphHttpUri: GRAPH_HTTP_MAINNET,
    graphWsUri: GRAPH_WS_MAINNET,
  },
  [networkIds.RINKEBY]: {
    earliestBlockToCheck: EARLIEST_RINKEBY_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: '0x36bede640D19981A82090519bC1626249984c908',
      realitioAddress: '0x3D00D77ee771405628a4bA4913175EcC095538da',
    },
    tokens: [
      {
        symbol: 'DAI',
        address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
        decimals: 18,
      },
      {
        symbol: 'USDC',
        address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
        decimals: 6,
      },
    ],
    graphHttpUri: GRAPH_HTTP_RINKEBY,
    graphWsUri: GRAPH_WS_RINKEBY,
  },
}

export class NetworkConfig {
  constructor(public networkId: NetworkId) {}

  static isKnownNetwork(networkId: number): networkId is NetworkId {
    return networkId === 1 || networkId === 4
  }

  getConditionalTokensAddress() {
    return networks[this.networkId].contracts.conditionalTokensAddress
  }

  getRealitioAddress() {
    return networks[this.networkId].contracts.realitioAddress
  }

  getTokens() {
    return networks[this.networkId].tokens
  }
}

export const getGraphUris = (networkId: number): { httpUri: string; wsUri: string } => {
  if (!NetworkConfig.isKnownNetwork(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  const httpUri = networks[networkId].graphHttpUri
  const wsUri = networks[networkId].graphWsUri
  return { httpUri, wsUri }
}

export const getEarliestBlockToCheck = (networkId: number): number => {
  if (!NetworkConfig.isKnownNetwork(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  return networks[networkId].earliestBlockToCheck
}

interface KnownOracleData {
  name: string
  url: string
  addresses: {
    [networkId: number]: string
  }
}

export const knownOracles: { [name in KnownOracle]: KnownOracleData } = {
  realitio: {
    name: 'Realitio Team',
    url: 'https://realit.io/',
    addresses: {
      [networkIds.MAINNET]: '0x0e414d014a77971f4eaa22ab58e6d84d16ea838e',
      [networkIds.RINKEBY]: '0x576B76eebE6B5411c0ef310E65De9Bff8A60130F',
    },
  },
  kleros: {
    name: 'Kleros',
    url: 'https://kleros.io/',
    addresses: {
      [networkIds.MAINNET]: '0x0000000000000000000000000000000000000000',
      [networkIds.RINKEBY]: '0x0000000000000000000000000000000000000000',
    },
  },
  unknown: {
    name: 'Unknown',
    url: '',
    addresses: {},
  },
}

export const getKnowOracleFromAddress = (networkId: number, address: string): KnownOracle => {
  for (const key in knownOracles) {
    const oracleAddress = knownOracles[key as KnownOracle].addresses[networkId]

    if (!oracleAddress) {
      continue
    }

    if (oracleAddress.toLowerCase() === address.toLowerCase()) {
      return key as KnownOracle
    }
  }

  return 'unknown' as KnownOracle
}
