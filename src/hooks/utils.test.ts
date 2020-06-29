import { ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import { marshalPositionLisData } from './utils'
import { Positions_positions, UserWithPositions_user } from 'types/generatedGQL'

const positions: Positions_positions[] = [
  {
    __typename: 'Position',
    id: 'Position1',
    collateralToken: {
      __typename: 'CollateralToken',
      id: 'token1',
    },
  },
  {
    __typename: 'Position',
    id: 'Position2',
    collateralToken: {
      __typename: 'CollateralToken',
      id: 'token1',
    },
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
    },
  ],
}

test('marshalPositionLisData should return the Positions without balances', async () => {
  const expected = [
    {
      id: 'Position1',
      collateralToken: 'token1',
      userBalance: ZERO_BN,
    },
    {
      id: 'Position2',
      collateralToken: 'token1',
      userBalance: ZERO_BN,
    },
  ]

  expect(marshalPositionLisData(positions, null)).toStrictEqual(expected)
})

test('marshalPositionLisData should return the Positions with some balances', async () => {
  const expected = [
    {
      id: 'Position1',
      collateralToken: 'token1',
      userBalance: new BigNumber('100'),
    },
    {
      id: 'Position2',
      collateralToken: 'token1',
      userBalance: ZERO_BN,
    },
  ]

  expect(marshalPositionLisData(positions, userWithBalance)).toStrictEqual(expected)
})
