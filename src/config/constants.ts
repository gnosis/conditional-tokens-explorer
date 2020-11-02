import { BigNumber } from 'ethers/utils'

import { NetworkId } from 'util/types'

export const ZERO_BN = new BigNumber(0)
export const INFURA_ID = process.env.REACT_APP_INFURA_ID
export const DEFAULT_NETWORK_ID: NetworkId = Number(
  process.env.REACT_APP_DEFAULT_NETWORK_ID || 1
) as NetworkId

export const CTE_GRAPH_HTTP_MAINNET =
  process.env.REACT_APP_CTE_GRAPH_HTTP_MAINNET ||
  'https://api.thegraph.com/subgraphs/name/gnosis/hg'
export const CTE_GRAPH_WS_MAINNET =
  process.env.REACT_APP_CTE_GRAPH_WS_MAINNET || 'wss://api.thegraph.com/subgraphs/name/gnosis/hg'
export const CTE_GRAPH_HTTP_RINKEBY =
  process.env.REACT_APP_CTE_GRAPH_HTTP_RINKEBY ||
  'https://api.thegraph.com/subgraphs/name/gnosis/hg-rinkeby'
export const CTE_GRAPH_WS_RINKEBY =
  process.env.REACT_APP_CTE_GRAPH_WS_RINKEBY ||
  'wss://api.thegraph.com/subgraphs/name/gnosis/hg-rinkeby'
export const CTE_GRAPH_HTTP_GANACHE =
  process.env.REACT_APP_CTE_GRAPH_HTTP_GANACHE || 'http://localhost:8000/subgraphs/name/gnosis/hg'
export const CTE_GRAPH_WS_GANACHE =
  process.env.REACT_APP_CTE_GRAPH_WS_GANACHE || 'ws://localhost:8001/subgraphs/name/gnosis/hg'

export const OMEN_GRAPH_HTTP_MAINNET =
  process.env.REACT_APP_OMEN_GRAPH_HTTP_MAINNET ||
  'https://api.thegraph.com/subgraphs/name/gnosis/omen'
export const OMEN_GRAPH_WS_MAINNET =
  process.env.REACT_APP_OMEN_GRAPH_WS_MAINNET || 'wss://api.thegraph.com/subgraphs/name/gnosis/omen'
export const OMEN_GRAPH_HTTP_RINKEBY =
  process.env.REACT_APP_OMEN_GRAPH_HTTP_RINKEBY ||
  'https://api.thegraph.com/subgraphs/name/gnosis/omen-rinkeby'
export const OMEN_GRAPH_WS_RINKEBY =
  process.env.REACT_APP_OMEN_GRAPH_WS_RINKEBY ||
  'wss://api.thegraph.com/subgraphs/name/gnosis/omen-rinkeby'

export const BYTES_REGEX = /^0x[a-fA-F0-9]{64}$/
export const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
export const INTEGER_NUMBER = /^[0-9]+$/
export const MIN_OUTCOMES = 2
export const MAX_OUTCOMES = 256

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

export const CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_MAINNET =
  process.env.REACT_APP_CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_MAINNET ||
  '0xC59b0e4De5F1248C1140964E0fF287B192407E0C'
export const CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_RINKEBY =
  process.env.REACT_APP_CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_RINKEBY ||
  '0x36bede640D19981A82090519bC1626249984c908'
export const CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_GANACHE =
  process.env.REACT_APP_CONDITIONAL_TOKEN_CONTRACT_ADDRESS_FOR_GANACHE ||
  '0xA57B8a5584442B467b4689F1144D269d096A3daF'

export const REALITY_CONTRACT_ADDRESS_FOR_MAINNET =
  process.env.REACT_APP_REALITY_CONTRACT_ADDRESS_FOR_MAINNET ||
  '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47'
export const REALITY_CONTRACT_ADDRESS_FOR_RINKEBY =
  process.env.REACT_APP_REALITY_CONTRACT_ADDRESS_FOR_RINKEBY ||
  '0x3D00D77ee771405628a4bA4913175EcC095538da'
export const REALITY_CONTRACT_ADDRESS_FOR_GANACHE =
  process.env.REACT_APP_REALITY_CONTRACT_ADDRESS_FOR_GANACHE ||
  '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'

export const WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_MAINNET =
  process.env.REACT_APP_WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_MAINNET ||
  '0xEC9Cc78463b72D7246E8189Df5EeD5fDc3508E71'
export const WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_RINKEBY =
  process.env.REACT_APP_WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_RINKEBY ||
  '0xEC9Cc78463b72D7246E8189Df5EeD5fDc3508E71'
export const WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_GANACHE =
  process.env.REACT_APP_WRAPPED_1155_FACTORY_CONTRACT_ADDRESS_FOR_GANACHE || ''

export const CONFIRMATIONS_TO_WAIT = Number(process.env.REACT_APP_CONFIRMATIONS_TO_WAIT || 4)

export const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID || null

export const navItems = [
  {
    title: 'Conditions',
    url: '/conditions',
  },
  {
    title: 'Positions',
    url: '/positions',
  },
  {
    title: 'Prepare Condition',
    url: '/prepare',
  },
  {
    title: 'Split Position',
    url: '/split',
  },
  {
    title: 'Merge Positions',
    url: '/merge',
  },
  {
    title: 'Report Payouts',
    url: '/report',
  },
  {
    title: 'Redeem Positions',
    url: '/redeem',
  },
]

export const REALITY_TIMEOUT = process.env.REACT_APP_REALITY_TIMEOUT

export const SINGLE_SELECT_TEMPLATE_ID = 2

export const MIN_OUTCOMES_ALLOWED = Number(process.env.REACT_APP_MIN_OUTCOMES_ALLOWED || 2)

export const MAX_OUTCOMES_ALLOWED = Number(process.env.REACT_APP_MAX_OUTCOMES_ALLOWED || 256)

export const MAX_DATE = '2030-01-01'
export const MIN_DATE = '2015-07-30'
