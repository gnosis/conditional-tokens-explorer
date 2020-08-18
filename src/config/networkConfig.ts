import { NetworkIds, Token } from '../util/types'

import {
  EARLIEST_GANACHE_BLOCK_TO_CHECK,
  CONDITION_TOKEN_CONTRACT_ADDRESS_FOR_MAINNET,
  CONDITION_TOKEN_CONTRACT_ADDRESS_FOR_RINKEBY,
  EARLIEST_MAINNET_BLOCK_TO_CHECK,
  EARLIEST_RINKEBY_BLOCK_TO_CHECK,
  GRAPH_HTTP_GANACHE,
  GRAPH_HTTP_MAINNET,
  GRAPH_HTTP_RINKEBY,
  GRAPH_WS_GANACHE,
  GRAPH_WS_MAINNET,
  GRAPH_WS_RINKEBY,
  REALITIO_CONTRACT_ADDRESS_FOR_MAINNET,
  REALITIO_CONTRACT_ADDRESS_FOR_RINKEBY,
} from './constants'

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

const networks: { [K in NetworkIds]: Network } = {
  [NetworkIds.MAINNET]: {
    earliestBlockToCheck: EARLIEST_MAINNET_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: CONDITION_TOKEN_CONTRACT_ADDRESS_FOR_MAINNET,
      realitioAddress: REALITIO_CONTRACT_ADDRESS_FOR_MAINNET,
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
      {
        symbol: 'CDAI',
        address: '0xa4c993e32876795abf80842adb0a241bb0eecd47',
        decimals: 18,
      },
      {
        symbol: 'WETH',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        decimals: 18,
      },
      {
        symbol: 'OWL',
        address: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
        decimals: 18,
      },
      {
        symbol: 'GNO',
        address: '0x6810e776880c02933d47db1b9fc05908e5386b96',
        decimals: 18,
      },
      {
        symbol: 'CHAI',
        address: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
        decimals: 18,
      },
      {
        symbol: 'PNK',
        address: '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
        decimals: 18,
      },
      {
        symbol: 'DXD',
        address: '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521',
        decimals: 18,
      },
    ],
    graphHttpUri: GRAPH_HTTP_MAINNET,
    graphWsUri: GRAPH_WS_MAINNET,
  },
  [NetworkIds.RINKEBY]: {
    earliestBlockToCheck: EARLIEST_RINKEBY_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: CONDITION_TOKEN_CONTRACT_ADDRESS_FOR_RINKEBY,
      realitioAddress: REALITIO_CONTRACT_ADDRESS_FOR_RINKEBY,
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
      {
        symbol: 'CDAI',
        address: '0x7a978b38d5af06ff929ca06647e025b759479318',
        decimals: 18,
      },
      {
        symbol: 'WETH',
        address: '0xc778417e063141139fce010982780140aa0cd5ab',
        decimals: 18,
      },
      {
        symbol: 'OWL',
        address: '0x9187a7788410f54a630407fa994c1555722f9abc',
        decimals: 18,
      },
      {
        symbol: 'GNO',
        address: '0x3e6e3f3266b1c3d814f9d237e7d144e563292112',
        decimals: 18,
      },
    ],
    graphHttpUri: GRAPH_HTTP_RINKEBY,
    graphWsUri: GRAPH_WS_RINKEBY,
  },
  [NetworkIds.GANACHE]: {
    earliestBlockToCheck: EARLIEST_GANACHE_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: '0xA57B8a5584442B467b4689F1144D269d096A3daF',
      realitioAddress: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
    },
    tokens: [
      {
        symbol: 'DAI',
        address: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
        decimals: 18,
      },
      {
        symbol: 'USDC',
        address: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
        decimals: 6,
      },
      {
        symbol: 'CDAI',
        address: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
        decimals: 18,
      },
      {
        symbol: 'WETH',
        address: '0x0290FB167208Af455bB137780163b7B7a9a10C16',
        decimals: 18,
      },
      {
        symbol: 'OWL',
        address: '0x59d3631c86BbE35EF041872d502F218A39FBa150',
        decimals: 18,
      },
      {
        symbol: 'GNO',
        address: '0x9b1f7F645351AF3631a656421eD2e40f2802E6c0',
        decimals: 18,
      },
    ],
    graphHttpUri: GRAPH_HTTP_GANACHE,
    graphWsUri: GRAPH_WS_GANACHE,
  },
}

export class NetworkConfig {
  constructor(public networkId: NetworkIds) {}

  static isKnownNetwork(networkId: number): networkId is NetworkIds {
    return networkId === 1 || networkId === 4 || networkId === 50
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
      [NetworkIds.MAINNET]: '0x0e414d014a77971f4eaa22ab58e6d84d16ea838e',
      [NetworkIds.RINKEBY]: '0x576b76eebe6b5411c0ef310e65de9bff8a60130f',
      [NetworkIds.GANACHE]: '0xDb56f2e9369E0D7bD191099125a3f6C370F8ed15',
    },
  },
  kleros: {
    name: 'Kleros',
    url: 'https://kleros.io/',
    addresses: {
      [NetworkIds.MAINNET]: '0x0000000000000000000000000000000000000000',
      [NetworkIds.RINKEBY]: '0x0000000000000000000000000000000000000000',
      [NetworkIds.GANACHE]: '0x0000000000000000000000000000000000000000',
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

export const getTokenFromAddress = (networkId: number, address: string): Token => {
  if (!NetworkConfig.isKnownNetwork(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }

  const tokens = networks[networkId].tokens

  for (const token of tokens) {
    const tokenAddress = token.address
    if (tokenAddress.toLowerCase() === address.toLowerCase()) {
      return token
    }
  }

  throw new Error(`Couldn't find token with address '${address}' in network '${networkId}'`)
}
