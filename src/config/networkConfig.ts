import {
  CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_GANACHE,
  CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_MAINNET,
  CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_RINKEBY,
  CTE_GRAPH_HTTP_GANACHE,
  CTE_GRAPH_HTTP_MAINNET,
  CTE_GRAPH_HTTP_RINKEBY,
  CTE_GRAPH_WS_GANACHE,
  CTE_GRAPH_WS_MAINNET,
  CTE_GRAPH_WS_RINKEBY,
  EARLIEST_GANACHE_BLOCK_TO_CHECK,
  EARLIEST_MAINNET_BLOCK_TO_CHECK,
  EARLIEST_RINKEBY_BLOCK_TO_CHECK,
  OMEN_GRAPH_HTTP_MAINNET,
  OMEN_GRAPH_HTTP_RINKEBY,
  OMEN_GRAPH_WS_MAINNET,
  OMEN_GRAPH_WS_RINKEBY,
  REALITIO_CONTRACT_ADDRESS_FOR_GANACHE,
  REALITIO_CONTRACT_ADDRESS_FOR_MAINNET,
  REALITIO_CONTRACT_ADDRESS_FOR_RINKEBY,
  WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_GANACHE,
  WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_MAINNET,
  WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_RINKEBY,
} from 'config/constants'
import { Arbitrator, NetworkIds, Oracle, Token } from 'util/types'

type CPKAddresses = {
  masterCopyAddress: string
  proxyFactoryAddress: string
  multiSendAddress: string
  fallbackHandlerAddress: string
}

interface Network {
  earliestBlockToCheck: number
  contracts: {
    conditionalTokensAddress: string
    realitioAddress: string
    wrapped1155FactoryAddress: string
    cpk?: CPKAddresses
  }
  tokens: Token[]
  CTEGraphHttpUri: string
  CTEGraphWsUri: string
  OMENGraphHttpUri: string
  OMENGraphWsUri: string
  oracles: Oracle[]
  arbitrators: Arbitrator[]
  realitioTimeout: number
}

const networks: { [K in NetworkIds]: Network } = {
  [NetworkIds.MAINNET]: {
    earliestBlockToCheck: EARLIEST_MAINNET_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_MAINNET,
      realitioAddress: REALITIO_CONTRACT_ADDRESS_FOR_MAINNET,
      wrapped1155FactoryAddress: WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_MAINNET,
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
    CTEGraphHttpUri: CTE_GRAPH_HTTP_MAINNET,
    CTEGraphWsUri: CTE_GRAPH_WS_MAINNET,
    OMENGraphHttpUri: OMEN_GRAPH_HTTP_MAINNET,
    OMENGraphWsUri: OMEN_GRAPH_WS_MAINNET,
    oracles: [
      {
        name: 'kleros',
        description: 'Kleros',
        url: 'https://kleros.io/',
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'realitio',
        description: 'Realit.io',
        url: 'https://realit.io/',
        address: '0x0e414d014a77971f4eaa22ab58e6d84d16ea838e',
      },
    ],
    arbitrators: [
      {
        name: 'kleros',
        description: 'Kleros',
        url: 'https://kleros.io/',
        address: '0xd47f72a2d1d0E91b0Ec5e5f5d02B2dc26d00A14D',
      },
      {
        name: 'realitio',
        description: 'Realit.io',
        url: 'https://reality.eth.link',
        address: '0xdc0a2185031ecf89f091a39c63c2857a7d5c301a',
      },
    ],
    realitioTimeout: 86400,
  },
  [NetworkIds.RINKEBY]: {
    earliestBlockToCheck: EARLIEST_RINKEBY_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_RINKEBY,
      realitioAddress: REALITIO_CONTRACT_ADDRESS_FOR_RINKEBY,
      wrapped1155FactoryAddress: WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_RINKEBY,
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
        address: '0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D',
        decimals: 18,
      },
      {
        symbol: 'GNO',
        address: '0x3e6e3f3266b1c3d814f9d237e7d144e563292112',
        decimals: 18,
      },
    ],
    CTEGraphHttpUri: CTE_GRAPH_HTTP_RINKEBY,
    CTEGraphWsUri: CTE_GRAPH_WS_RINKEBY,
    OMENGraphHttpUri: OMEN_GRAPH_HTTP_RINKEBY,
    OMENGraphWsUri: OMEN_GRAPH_WS_RINKEBY,
    oracles: [
      {
        name: 'kleros',
        description: 'Kleros',
        url: 'https://kleros.io/',
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'realitio',
        description: 'Realit.io',
        url: 'https://realit.io/',
        address: '0x576b76eebe6b5411c0ef310e65de9bff8a60130f',
      },
    ],
    arbitrators: [
      {
        name: 'kleros',
        description: 'Kleros',
        url: 'https://kleros.io/',
        address: '0xcafa054b1b054581faf65adce667bf1c684b6ef0',
      },
      {
        name: 'realitio',
        description: 'Realitio Team',
        url: 'https://reality.eth.link',
        address: '0x02321745bE4a141E78db6C39834396f8df00e2a0',
      },
    ],
    realitioTimeout: 10,
  },
  [NetworkIds.GANACHE]: {
    earliestBlockToCheck: EARLIEST_GANACHE_BLOCK_TO_CHECK,
    contracts: {
      conditionalTokensAddress: CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_GANACHE,
      realitioAddress: REALITIO_CONTRACT_ADDRESS_FOR_GANACHE,
      wrapped1155FactoryAddress: WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_GANACHE,
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
    CTEGraphHttpUri: CTE_GRAPH_HTTP_GANACHE,
    CTEGraphWsUri: CTE_GRAPH_WS_GANACHE,
    OMENGraphHttpUri: '',
    OMENGraphWsUri: '',
    oracles: [
      {
        name: 'kleros',
        description: 'Kleros',
        url: 'https://kleros.io/',
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'realitio',
        description: 'Realit.io',
        url: 'https://realit.io/',
        address: '0xDb56f2e9369E0D7bD191099125a3f6C370F8ed15',
      },
    ],
    arbitrators: [
      {
        name: 'kleros',
        description: 'Kleros',
        url: 'https://kleros.io/',
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'realitio',
        description: 'Realit.io',
        url: 'https://reality.eth.link',
        address: '0x0000000000000000000000000000000000000000',
      },
    ],
    realitioTimeout: 10,
  },
}

export class NetworkConfig {
  constructor(public networkId: NetworkIds) {}

  static isKnownNetwork(networkId: number): networkId is NetworkIds {
    return networkId === 1 || networkId === 4 || networkId === 50
  }

  getNetworkName(): string {
    switch (this.networkId) {
      case NetworkIds.MAINNET:
        return 'mainnet'
      case NetworkIds.RINKEBY:
        return 'rinkeby'
      case NetworkIds.GANACHE:
        return 'ganache'
      default:
        return 'unknown'
    }
  }

  getConditionalTokensAddress(): string {
    return networks[this.networkId].contracts.conditionalTokensAddress
  }

  getRealitioAddress(): string {
    return networks[this.networkId].contracts.realitioAddress
  }

  getWrapped1155FactoryAddress(): string {
    return networks[this.networkId].contracts.wrapped1155FactoryAddress
  }

  getTokens(): Token[] {
    return networks[this.networkId].tokens
  }

  getOracles(): Oracle[] {
    return networks[this.networkId].oracles
  }

  getArbitrators(): Oracle[] {
    return networks[this.networkId].arbitrators
  }

  getGraphUris(): { CTEhttpUri: string; CTEwsUri: string; OMENhttpUri: string; OMENwsUri: string } {
    const CTEhttpUri = networks[this.networkId].CTEGraphHttpUri
    const CTEwsUri = networks[this.networkId].CTEGraphWsUri
    const OMENhttpUri = networks[this.networkId].OMENGraphHttpUri
    const OMENwsUri = networks[this.networkId].OMENGraphWsUri
    return { CTEhttpUri, CTEwsUri, OMENhttpUri, OMENwsUri }
  }

  getEarliestBlockToCheck(): number {
    return networks[this.networkId].earliestBlockToCheck
  }

  getTokenFromAddress(address: string): Token {
    const tokens = networks[this.networkId].tokens

    for (const token of tokens) {
      const tokenAddress = token.address
      if (tokenAddress.toLowerCase() === address.toLowerCase()) {
        return token
      }
    }

    throw new Error(`Couldn't find token with address '${address}' in network '${this.networkId}'`)
  }

  getOracleFromAddress(address: string): Oracle {
    const oracles = networks[this.networkId].oracles

    for (const oracle of oracles) {
      const oracleAddress = oracle.address
      if (oracleAddress.toLowerCase() === address.toLowerCase()) {
        return oracle
      }
    }

    return {
      name: 'unknown',
      description: 'Unknown',
      url: '',
      address: '',
    }
  }

  getOracleFromName(oracleName: KnownOracle): Oracle {
    const oracles = networks[this.networkId].oracles

    for (const oracle of oracles) {
      if (oracle.name === oracleName) {
        return oracle
      }
    }

    return {
      name: 'unknown',
      description: 'Unknown',
      url: '',
      address: '',
    }
  }

  getArbitratorFromAddress(address: string): Oracle {
    const arbitrators = networks[this.networkId].arbitrators

    for (const arbitrator of arbitrators) {
      const arbitratorAddress = arbitrator.address
      if (arbitratorAddress.toLowerCase() === address.toLowerCase()) {
        return arbitrator
      }
    }

    return {
      name: 'unknown',
      description: 'Unknown',
      url: '',
      address: '',
    }
  }

  getArbitratorFromName(arbitratorName: KnownArbitrator): Arbitrator {
    const arbitrators = networks[this.networkId].arbitrators

    for (const arbitrator of arbitrators) {
      if (arbitrator.name === arbitratorName) {
        return arbitrator
      }
    }

    return {
      name: 'unknown',
      description: 'Unknown',
      url: '',
      address: '',
    }
  }

  getRealitioTimeout(): number {
    return networks[this.networkId].realitioTimeout
  }

  getCPKAddresses(): Maybe<CPKAddresses> {
    const cpkAddresses = networks[this.networkId].contracts.cpk
    return cpkAddresses || null
  }
}
