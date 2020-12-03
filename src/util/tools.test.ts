import { BigNumber } from 'ethers/utils'

import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import {
  arePositionMergeables,
  arePositionMergeablesByCondition,
  getMergePreview,
  getParentCollectionId,
  getRedeemedBalance,
  getRedeemedPreview,
  indexSetFromOutcomes,
  isConditionFullIndexSet,
  isDisjointPartition,
  isFullIndexSetPartition,
  positionString,
  positionsSameConditionsSet,
} from 'util/tools'
import { Token } from 'util/types'

test('positionString should return the rigth Positions string', async () => {
  expect(
    positionString(['0x123', '0x345'], [1, 5].map(String), new BigNumber(`${1e19}`), {
      symbol: 'DAI',
      address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      decimals: 18,
    } as Token)
  ).toStrictEqual('[DAI C:0x123 O:0 & C:0x345 O:0|2] x10.00')
})

const positions: PositionWithUserBalanceWithDecimals[] = [
  {
    id: '0x0b12077261024ae2cfa078cc329234dabae53e38bb68d14005027e66105b4332',
    indexSets: ['2'],
    conditionIds: ['0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f'],
    createTimestamp: 2,
    collateralToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0x1673bab498c5019f2a9eae23b5506eb9a5043b4b910c04c0cd529f27797a34dc',
    indexSets: ['5'],
    conditionIds: ['0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f'],
    createTimestamp: 2,
    collateralToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0xae08dcc0c88f95ac5938445a2c3589229be7e928aa4cc7709c61535c45c4cdeb',
    indexSets: ['1', '5'],
    conditionIds: [
      '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
      '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
    ],
    createTimestamp: 2,
    collateralToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
        outcomeSlotCount: 2,
        oracle: '',
        questionId: '',
      },
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0xfb66d52cfff63f2a23b4456c3636383888cc2ec313513cf736c8acae67c53e29',
    indexSets: ['2', '5'],
    conditionIds: [
      '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
      '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
    ],
    createTimestamp: 2,
    collateralToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
        outcomeSlotCount: 2,
        oracle: '',
        questionId: '',
      },
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
]

const positionsUSDC: PositionWithUserBalanceWithDecimals[] = [
  {
    id: '0x0b12077261024ae2cfa078cc329234dabae53e38bb68d14005027e66105b4332',
    indexSets: ['2'],
    conditionIds: ['0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f'],
    createTimestamp: 2,
    collateralToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0x1673bab498c5019f2a9eae23b5506eb9a5043b4b910c04c0cd529f27797a34dc',
    indexSets: ['4'],
    conditionIds: ['0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f'],
    createTimestamp: 2,
    collateralToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0xed780c42f5d8d7d7cb9a4d81f63af01cf0c1a9c81e5c05dc12f846b077e75001',
    indexSets: ['1'],
    conditionIds: ['0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f'],
    createTimestamp: 2,
    collateralToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0xae08dcc0c88f95ac5938445a2c3589229be7e928aa4cc7709c61535c45c4cdeb',
    indexSets: ['1', '5'],
    conditionIds: [
      '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
      '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
    ],
    createTimestamp: 2,
    collateralToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
        outcomeSlotCount: 2,
        oracle: '',
        questionId: '',
      },
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
  {
    id: '0xfb66d52cfff63f2a23b4456c3636383888cc2ec313513cf736c8acae67c53e29',
    indexSets: ['2', '5'],
    conditionIds: [
      '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
      '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
    ],
    createTimestamp: 2,
    collateralToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    wrappedToken: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    userBalanceERC1155: new BigNumber(1),
    userBalanceERC20: new BigNumber(1),
    conditions: [
      {
        conditionId: '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
        outcomeSlotCount: 2,
        oracle: '',
        questionId: '',
      },
      {
        conditionId: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
        outcomeSlotCount: 3,
        oracle: '',
        questionId: '',
      },
    ],
    userBalanceERC1155WithDecimals: '',
    userBalanceERC20WithDecimals: '',
    userBalanceERC1155Numbered: 0,
    userBalanceERC20Numbered: 0,
    collateralTokenERC1155: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    collateralTokenSymbol: 'USDC',
    collateralTokenERC20: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
    token: {
      symbol: '',
      address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
      decimals: 18,
    },
  },
]

const resolvedConditions: GetCondition_condition[] = [
  {
    creator: '0xc759678ef908eab0e9d94599da7b8848c0af35c2',
    id: '0xc1157d244e86a352e3a56c8f17c96bf58e6150a0c700d67e0906ec392bd812e3',
    oracle: '0xc759678ef908eab0e9d94599da7b8848c0af35c2',
    outcomeSlotCount: 2,
    payoutDenominator: '100',
    payoutNumerators: ['75', '25'],
    payouts: ['0.75', '0.25'],
    positions: [
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0xae08dcc0c88f95ac5938445a2c3589229be7e928aa4cc7709c61535c45c4cdeb',
        __typename: 'Position',
      },
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0xfb66d52cfff63f2a23b4456c3636383888cc2ec313513cf736c8acae67c53e29',
        __typename: 'Position',
      },
    ],
    questionId: '0xf9ff13c514572a600f9ea2795eeded39002e0ae5d2d055664d0e7def481e62c7',
    resolveTimestamp: '1597155513',
    resolved: true,
    __typename: 'Condition',
  },
  {
    creator: '0xc759678ef908eab0e9d94599da7b8848c0af35c2',
    id: '0xf583ac873d83f9db78f7a8fe18a2b8e3d050d8a283c41a014a5b8df45c20856f',
    oracle: '0xc759678ef908eab0e9d94599da7b8848c0af35c2',
    outcomeSlotCount: 3,
    payoutDenominator: '100',
    payoutNumerators: ['25', '50', '25'],
    payouts: ['0.25', '0.50', '0.25'],
    positions: [
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0x0b12077261024ae2cfa078cc329234dabae53e38bb68d14005027e66105b4332',
        __typename: 'Position',
      },
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0x1673bab498c5019f2a9eae23b5506eb9a5043b4b910c04c0cd529f27797a34dc',
        __typename: 'Position',
      },
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0xae08dcc0c88f95ac5938445a2c3589229be7e928aa4cc7709c61535c45c4cdeb',
        __typename: 'Position',
      },
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0xed780c42f5d8d7d7cb9a4d81f63af01cf0c1a9c81e5c05dc12f846b077e75001',
        __typename: 'Position',
      },
      {
        collateralToken: {
          id: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
          __typename: 'CollateralToken',
        },
        id: '0xfb66d52cfff63f2a23b4456c3636383888cc2ec313513cf736c8acae67c53e29',
        __typename: 'Position',
      },
    ],
    questionId: '0xf9ff13c514572a600f9ea2795eeded39002e0ae5d2d055664d0e7def481e62c3',
    resolveTimestamp: '1597078294',
    resolved: true,
    __typename: 'Condition',
  },
]

test('getRedeemedBalance should return the balance for single outcome position', async () => {
  // conditions outcomes 2, payouts [0.75, 0.25]
  // position indexSet 2 (O:1)
  expect(
    getRedeemedBalance(positions[3], resolvedConditions[0], new BigNumber(`${1e19}`)).toString()
  ).toStrictEqual('2500000000000000000')
})

test('getRedeemedBalance should return the balance for multi outcome position', async () => {
  // conditions outcomes 3, payouts [0.25, 0.5, 0.25]
  // position indexSet 5 (O:0|2)
  expect(
    getRedeemedBalance(positions[1], resolvedConditions[1], new BigNumber(`${1e19}`)).toString()
  ).toStrictEqual('5000000000000000000')
})

test('getRedeemedPreview should return new position to redeem', async () => {
  expect(
    getRedeemedPreview(positions[2], resolvedConditions[0].id, new BigNumber(`${1e19}`), {
      symbol: 'DAI',
      address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      decimals: 18,
    } as Token)
  ).toStrictEqual('[DAI C:0xf583ac...20856f O:0|2] x10.00')
})

test('getRedeemedPreview should return new collateral to redeem', async () => {
  expect(
    getRedeemedPreview(positions[1], resolvedConditions[1].id, new BigNumber(`${1e19}`), {
      symbol: 'DAI',
      address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      decimals: 18,
    } as Token)
  ).toStrictEqual('10.00 DAI')
})

test('#positionsSameConditionsSet - should work', async () => {
  expect(positionsSameConditionsSet(positions)).toEqual(false)
  expect(positionsSameConditionsSet([positions[0], positions[1]])).toEqual(true)
  expect(positionsSameConditionsSet([positions[2], positions[3]])).toEqual(true)
  expect(positionsSameConditionsSet([positionsUSDC[0], positionsUSDC[1]])).toEqual(true)
})

test('#arePositionMergeables - positions should not be mergeable with only 1 position', async () => {
  expect(arePositionMergeables([positions[0]])).toEqual(false)
})

test('#arePositionMergeables - positions should not be mergeable when containing different collateral', async () => {
  expect(arePositionMergeables([positions[0], positionsUSDC[1]])).toEqual(false)
})

test('#arePositionMergeables - positions should not be mergeable when containing different colletions set', async () => {
  expect(arePositionMergeables(positions)).toEqual(false)
})

test('#arePositionMergeables - positions should be mergeable', async () => {
  expect(arePositionMergeables([positions[0], positions[1]])).toEqual(true)
  expect(arePositionMergeables([positions[2], positions[3]])).toEqual(true)
  expect(arePositionMergeables([positionsUSDC[0], positionsUSDC[1]])).toEqual(true)
})

test('#arePositionMergeablesByCondition - positions should be mergeable by condition when fillIndexSet partition', async () => {
  expect(
    arePositionMergeablesByCondition(
      [positions[0], positions[1]],
      resolvedConditions[1].id,
      resolvedConditions[1].outcomeSlotCount
    )
  ).toEqual(true)
  expect(
    arePositionMergeablesByCondition(
      [positions[2], positions[3]],
      resolvedConditions[0].id,
      resolvedConditions[0].outcomeSlotCount
    )
  ).toEqual(true)
})

test('#arePositionMergeablesByCondition - positions should be mergeable by condition when disjoint not fillIndexSet partition', async () => {
  expect(
    arePositionMergeablesByCondition(
      [positionsUSDC[0], positionsUSDC[1]],
      resolvedConditions[1].id,
      resolvedConditions[1].outcomeSlotCount
    )
  ).toEqual(true)
})

test('#isConditionFullIndexSet - should be false when positions are not mergeable', async () => {
  expect(
    isConditionFullIndexSet(
      [positions[0], positionsUSDC[1]],
      resolvedConditions[0].id,
      resolvedConditions[0].outcomeSlotCount
    )
  ).toEqual(false)
  expect(
    isConditionFullIndexSet(
      positions,
      resolvedConditions[0].id,
      resolvedConditions[0].outcomeSlotCount
    )
  ).toEqual(false)
})

test('#isConditionFullIndexSet - should be false when positions are not mergeable', async () => {
  expect(
    isConditionFullIndexSet(
      [positions[0], positionsUSDC[1]],
      resolvedConditions[0].id,
      resolvedConditions[0].outcomeSlotCount
    )
  ).toEqual(false)
  expect(
    isConditionFullIndexSet(
      positions,
      resolvedConditions[0].id,
      resolvedConditions[0].outcomeSlotCount
    )
  ).toEqual(false)
})

test('#isConditionFullIndexSet - should be false when positions are mergeable but not fullIndexSet', async () => {
  expect(
    isConditionFullIndexSet(
      [positionsUSDC[0], positionsUSDC[1]],
      resolvedConditions[1].id,
      resolvedConditions[1].outcomeSlotCount
    )
  ).toEqual(false)
})

test('#isConditionFullIndexSet - should be true', async () => {
  expect(
    isConditionFullIndexSet(
      [positionsUSDC[0], positionsUSDC[1], positionsUSDC[2]],
      resolvedConditions[1].id,
      resolvedConditions[1].outcomeSlotCount
    )
  ).toEqual(true)
})

test('isDisjointPartition should work', async () => {
  expect(isDisjointPartition([0b001].map(String), 3)).toEqual(false)

  expect(isDisjointPartition([0b001, 0b100].map(String), 0)).toEqual(false)

  expect(isDisjointPartition([0b101, 0b01, 0b10].map(String), 2)).toEqual(false)

  expect(isDisjointPartition([0b00, 0b01, 0b10].map(String), 2)).toEqual(false)

  expect(isDisjointPartition([0b101, 0b001].map(String), 3)).toEqual(false)

  expect(isDisjointPartition([0b100, 0b001].map(String), 3)).toEqual(true)
})

test('isFullIndexSetPartition should work', async () => {
  expect(isFullIndexSetPartition([0b001].map(String), 3)).toEqual(false)

  expect(isFullIndexSetPartition([0b001, 0b100].map(String), 0)).toEqual(false)

  expect(isFullIndexSetPartition([0b101, 0b01, 0b10].map(String), 2)).toEqual(false)

  expect(isFullIndexSetPartition([0b00, 0b01, 0b10].map(String), 2)).toEqual(false)

  expect(isFullIndexSetPartition([0b101, 0b001].map(String), 3)).toEqual(false)

  expect(isFullIndexSetPartition([0b100, 0b001].map(String), 3)).toEqual(false)

  expect(isFullIndexSetPartition([0b100, 0b001, 0b010].map(String), 3)).toEqual(true)

  expect(isFullIndexSetPartition([0b110, 0b001].map(String), 3)).toEqual(true)
})

test('getMergePreview should return new position when merging fullIndexSet partition', async () => {
  expect(
    getMergePreview(
      [positions[2], positions[3]],
      resolvedConditions[0].id,
      new BigNumber(`${1e19}`),
      {
        symbol: 'DAI',
        address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
        decimals: 18,
      } as Token,
      resolvedConditions[0].outcomeSlotCount
    )
  ).toStrictEqual('[DAI C:0xf583ac...20856f O:0|2] x10.00')
})

test('getMergePreview should return collateral when merging fullIndexSet partition', async () => {
  expect(
    getMergePreview(
      [positions[0], positions[2]],
      resolvedConditions[1].id,
      new BigNumber(`${1e19}`),
      {
        symbol: 'DAI',
        address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
        decimals: 18,
      } as Token,
      resolvedConditions[1].outcomeSlotCount
    )
  ).toStrictEqual('10.00 DAI')
})

test('getMergePreview should return new position when merging non fullIndexSet partition', async () => {
  expect(
    getMergePreview(
      [positionsUSDC[0], positionsUSDC[1]],
      resolvedConditions[1].id,
      new BigNumber(`${1e7}`),
      {
        symbol: 'USDC',
        address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
        decimals: 6,
      } as Token,
      resolvedConditions[1].outcomeSlotCount
    )
  ).toStrictEqual('[USDC C:0xf583ac...20856f O:1|2] x10.00')
})

test('indexSetFromOutcomes should return ORed values', async () => {
  expect(indexSetFromOutcomes(['1', '2', '4', '8', '16'])).toBe('31')
  expect(
    indexSetFromOutcomes(['1606938044258990275541962092341162602522202993782792835301376', '4'])
  ).toBe('1606938044258990275541962092341162602522202993782792835301380')
})

test('getParentCollection depth > 1 and first condition', async () => {
  expect(
    getParentCollectionId(
      ['8', '1'],
      [
        '0x3e803fe36846d0b57d002bb00fb4a916ef94787ddd4b7613c4e8090397eda27a',
        '0xfb8de9ceffa8431c00c2bf1a22b343a2bcbeba65f08ed41fc25c231ad44ff724',
      ],
      '0x3e803fe36846d0b57d002bb00fb4a916ef94787ddd4b7613c4e8090397eda27a'
    )
  ).toBe('0x296519534592413fb03189b1415f32f130d087ddcf09130e8ca07c5fab5264db')
})

test('getParentCollection depth > 1 and second condition', async () => {
  expect(
    getParentCollectionId(
      ['1', '1'],
      [
        '0x3e803fe36846d0b57d002bb00fb4a916ef94787ddd4b7613c4e8090397eda27a',
        '0xfb8de9ceffa8431c00c2bf1a22b343a2bcbeba65f08ed41fc25c231ad44ff724',
      ],
      '0xfb8de9ceffa8431c00c2bf1a22b343a2bcbeba65f08ed41fc25c231ad44ff724'
    )
  ).toBe('0x4adb0fa03dea49bf1b4a70c49ce524c48fb445810bb993fab2581c9596649749')
})

test('getParentCollection depth = 2 and first of two conditions resolved', async () => {
  expect(
    getParentCollectionId(
      ['8', '1'],
      [
        '0x2c610099cde2a76bc57b3c0311c4186c7991fa4ecaeaa2a7b4dcf1e74eef46eb',
        '0x80adf18b977d760304618d1911fb4b01f4b762e567b08783b98dbdacd891149f',
      ],
      '0x2c610099cde2a76bc57b3c0311c4186c7991fa4ecaeaa2a7b4dcf1e74eef46eb'
    )
  ).toBe('0x1a138aec008614dabc4d7c7068558fce7566059c54cfed43e9f9c24b0f708e66')
})

test('getParentCollection depth = 2 and second of two conditions resolved', async () => {
  expect(
    getParentCollectionId(
      ['8', '1'],
      [
        '0x2c610099cde2a76bc57b3c0311c4186c7991fa4ecaeaa2a7b4dcf1e74eef46eb',
        '0x80adf18b977d760304618d1911fb4b01f4b762e567b08783b98dbdacd891149f',
      ],
      '0x80adf18b977d760304618d1911fb4b01f4b762e567b08783b98dbdacd891149f'
    )
  ).toBe('0x10677f94b7bad290b26fb5af9556859c30558c22d66926f909088a2e48d88cad')
})

test('getParentCollection depth = 1 and first condition resolved', async () => {
  expect(
    getParentCollectionId(
      ['8'],
      ['0x2c610099cde2a76bc57b3c0311c4186c7991fa4ecaeaa2a7b4dcf1e74eef46eb'],
      '0x2c610099cde2a76bc57b3c0311c4186c7991fa4ecaeaa2a7b4dcf1e74eef46eb'
    )
  ).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
})
