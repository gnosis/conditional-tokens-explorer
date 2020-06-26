import {
  GRAPH_HTTP_MAINNET,
  GRAPH_WS_MAINNET,
  GRAPH_HTTP_RINKEBY,
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
  conditionalTokensAddress: string
  tokens: Token[]
  graphHttpUri: string
  graphWsUri: string
}

const networks: { [K in NetworkId]: Network } = {
  [networkIds.MAINNET]: {
    conditionalTokensAddress: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
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
    conditionalTokensAddress: '0xe6Cdc22F99FD9ffdC03647C7fFF5bB753a4eBB21',
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
    return networks[this.networkId].conditionalTokensAddress
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
