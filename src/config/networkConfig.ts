type NetworkId = 1 | 4

const networkIds = {
  MAINNET: 1,
  RINKEBY: 4,
} as const

interface Network {
  conditionalTokensContract: string
}

const networks: { [K in NetworkId]: Network } = {
  [networkIds.MAINNET]: {
    conditionalTokensContract: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
  },
  [networkIds.RINKEBY]: {
    conditionalTokensContract: '0xe6Cdc22F99FD9ffdC03647C7fFF5bB753a4eBB21',
  },
}

export class NetworkConfig {
  constructor(public networkId: NetworkId) {}

  // TODO Refactor?
  static isKnownNetwork(networkId: number): networkId is NetworkId {
    return networkId === 1 || networkId === 4
  }

  getConditionalTokenContract() {
    return networks[this.networkId].conditionalTokensContract
  }
}
