import { BigNumber } from 'ethers/utils'

import { ZERO_BN } from 'config/constants'
import { marshalPositionListData } from 'hooks/utils'
import { Positions_positions, UserWithPositions_user } from 'types/generatedGQL'

const positions: Positions_positions[] = [
  {
    __typename: 'Position',
    id: 'Position1',
    indexSets: [],
    activeValue: null,
    collateralToken: {
      __typename: 'CollateralToken',
      id: 'token1',
    },
    wrappedToken: {
      id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      __typename: 'WrappedToken',
    },
    createTimestamp: '1571930105',
    collection: {
      __typename: 'Collection',
      id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      conditions: [],
      conditionIds: [],
      indexSets: [],
      positions: null,
    },
    conditionIds: [],
    conditions: [],
  },
  {
    __typename: 'Position',
    id: 'Position2',
    indexSets: [],
    activeValue: null,
    collateralToken: {
      __typename: 'CollateralToken',
      id: 'token1',
    },
    wrappedToken: {
      id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      __typename: 'WrappedToken',
    },
    createTimestamp: '1571930105',
    collection: {
      __typename: 'Collection',
      id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      conditions: [],
      conditionIds: [],
      indexSets: [],
      positions: null,
    },
    conditionIds: [],
    conditions: [],
  },
]

const userWithBalance: UserWithPositions_user = {
  __typename: 'User',
  userPositions: [
    {
      __typename: 'UserPosition',
      id: '0x0',
      position: {
        __typename: 'Position',
        id: 'Position1',
      },
      balance: '100',
      wrappedBalance: '100',
      totalBalance: '100',
      user: {
        __typename: 'User',
        id: '0x18AD183A875e5A42a60Eb5D3a9D6657C3493d064',
      },
    },
  ],
}

test('marshalPositionListData should return the Positions without balances', async () => {
  const expected = [
    {
      id: 'Position1',
      collateralToken: 'token1',
      userBalanceERC1155: ZERO_BN,
      userBalanceERC20: ZERO_BN,
      wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      createTimestamp: '1571930105',
    },
    {
      id: 'Position2',
      collateralToken: 'token1',
      userBalanceERC1155: ZERO_BN,
      userBalanceERC20: ZERO_BN,
      wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      createTimestamp: '1571930105',
    },
  ]

  expect(marshalPositionListData(positions, null)).toStrictEqual(expected)
})

test('marshalPositionListData should return the Positions with some balances', async () => {
  const expected = [
    {
      id: 'Position1',
      collateralToken: 'token1',
      userBalanceERC1155: new BigNumber('100'),
      userBalanceERC20: new BigNumber('100'),
      wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      createTimestamp: '1571930105',
    },
    {
      id: 'Position2',
      collateralToken: 'token1',
      userBalanceERC1155: ZERO_BN,
      userBalanceERC20: ZERO_BN,
      wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      createTimestamp: '1571930105',
    },
  ]

  expect(marshalPositionListData(positions, userWithBalance)).toStrictEqual(expected)
})
