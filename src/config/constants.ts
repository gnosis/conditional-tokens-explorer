import { BigNumber } from 'ethers/utils'

import { NetworkId } from '../util/types'

export const ZERO_BN = new BigNumber(0)
export const INFURA_ID = process.env.REACT_APP_INFURA_ID
export const DEFAULT_NETWORK_ID: NetworkId = Number(
  process.env.REACT_APP_DEFAULT_NETWORK_ID || 1
) as NetworkId

export const GRAPH_HTTP_MAINNET =
  process.env.REACT_APP_GRAPH_HTTP_MAINNET || 'https://api.thegraph.com/subgraphs/name/gnosis/hg'
export const GRAPH_WS_MAINNET =
  process.env.REACT_APP_GRAPH_WS_MAINNET || 'wss://api.thegraph.com/subgraphs/name/gnosis/hg'
export const GRAPH_HTTP_RINKEBY =
  process.env.REACT_APP_GRAPH_HTTP_RINKEBY ||
  'https://api.thegraph.com/subgraphs/name/gnosis/hg-rinkeby'
export const GRAPH_WS_RINKEBY =
  process.env.REACT_APP_GRAPH_WS_RINKEBY ||
  'wss://api.thegraph.com/subgraphs/name/gnosis/hg-rinkeby'
export const GRAPH_HTTP_GANACHE =
  process.env.REACT_APP_GRAPH_HTTP_GANACHE || 'http://localhost:8000/subgraphs/name/gnosis/hg'
export const GRAPH_WS_GANACHE =
  process.env.REACT_APP_GRAPH_WS_GANACHE || 'ws://localhost:8001/subgraphs/name/gnosis/hg'

export const BYTES_REGEX = /^0x[a-fA-F0-9]{64}$/
export const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export const EARLIEST_MAINNET_BLOCK_TO_CHECK = Number(
  process.env.REACT_APP_EARLIEST_MAINNET_BLOCK_TO_CHECK || 9294139
)
export const EARLIEST_RINKEBY_BLOCK_TO_CHECK = Number(
  process.env.REACT_APP_EARLIEST_RINKEBY_BLOCK_TO_CHECK || 6127043
)
export const EARLIEST_GANACHE_BLOCK_TO_CHECK = Number(
  process.env.REACT_APP_EARLIEST_GANACHE_BLOCK_TO_CHECK || 0
)

export const INFORMATION_NOT_AVAILABLE = 'Information not available'

export const LOGGER_ID: string =
  process.env.REACT_APP_LOGGER_ID || 'gnosis-conditional-token-explorer'
