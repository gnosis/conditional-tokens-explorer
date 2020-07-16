import { BigNumber } from 'ethers/utils'
import { NetworkId } from './networkConfig'

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

export const BYTES_REGEX = /^0x[a-fA-F0-9]{64}$/
export const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const EARLIEST_MAINNET_BLOCK_TO_CHECK = Number(
  process.env.REACT_APP_EARLIEST_MAINNET_BLOCK_TO_CHECK || 9294139
)
export const EARLIEST_RINKEBY_BLOCK_TO_CHECK = Number(
  process.env.REACT_APP_EARLIEST_RINKEBY_BLOCK_TO_CHECK || 6127043
)

export const INFORMATION_NOT_AVAILABLE = 'Information not available'
