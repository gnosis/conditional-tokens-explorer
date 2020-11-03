import gql from 'graphql-tag'

import {
  AdvancedFilterPosition,
  CollateralFilterOptions,
  PositionSearchOptions,
  WrappedCollateralOptions,
} from 'util/types'

export interface PositionsListType {
  positionId?: string
  collateral?: string
  conditionsIds?: string[]
}

export const DEFAULT_OPTIONS = {
  conditionsIds: [],
  positionId: '',
  collateral: '',
}

export const DEFAULT_OPTIONS_LIST: AdvancedFilterPosition = {
  CollateralValue: {
    type: null,
    value: null,
  },
  FromCreationDate: null,
  ToCreationDate: null,
  TextToSearch: {
    type: PositionSearchOptions.PositionId,
    value: null,
  },
  WrappedCollateral: WrappedCollateralOptions.All,
}

const positionFragment = gql`
  fragment PositionData on Position {
    id
    indexSets
    activeValue
    createTimestamp
    collateralToken {
      id
    }
    wrappedToken {
      id
    }
    collection {
      id
      conditions {
        id
        oracle
        questionId
        outcomeSlotCount
        resolved
        creator
        payouts
        payoutNumerators
        payoutDenominator
      }
      conditionIds
      indexSets
      positions {
        id
      }
    }
    conditionIds
    conditions {
      id
      oracle
      questionId
      outcomeSlotCount
    }
  }
`
export const buildQueryPositionsList = (
  advancedFilter: AdvancedFilterPosition = DEFAULT_OPTIONS_LIST
) => {
  const {
    CollateralValue,
    FromCreationDate,
    TextToSearch,
    ToCreationDate,
    WrappedCollateral,
  } = advancedFilter

  const whereClauseInternal = [
    ToCreationDate ? 'createTimestamp_lte: $toCreationDate' : '',
    FromCreationDate ? 'createTimestamp_gte: $fromCreationDate' : '',
    CollateralValue.type !== CollateralFilterOptions.All &&
    CollateralValue.type !== CollateralFilterOptions.Custom &&
    CollateralValue.value
      ? 'collateralTokenAddress_in: $collateralSearch'
      : '',
    CollateralValue.type === CollateralFilterOptions.Custom && CollateralValue.value
      ? 'collateralTokenAddress_not_in: $collateralSearch'
      : '',
    TextToSearch.type === PositionSearchOptions.PositionId && TextToSearch.value
      ? 'positionId_contains: $textToSearch'
      : '',
    TextToSearch.type === PositionSearchOptions.ConditionId && TextToSearch.value
      ? 'conditionIdsStr_contains: $textToSearch'
      : '',
    TextToSearch.type === PositionSearchOptions.CollateralAddress && TextToSearch.value
      ? 'collateralTokenAddress_contains: $textToSearch'
      : '',
    TextToSearch.type === PositionSearchOptions.CollateralSymbol && TextToSearch.value
      ? 'collateralTokenAddress_in: $textToSearch'
      : '',
    TextToSearch.type === PositionSearchOptions.WrappedCollateralAddress && TextToSearch.value
      ? 'wrappedTokenAddress_contains: $textToSearch'
      : '',
    WrappedCollateral === WrappedCollateralOptions.Yes ? 'wrappedTokenAddress_not: null' : '',
    WrappedCollateral === WrappedCollateralOptions.No ? 'wrappedTokenAddress: null' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    ToCreationDate ? '$toCreationDate: BigInt' : '',
    FromCreationDate ? '$fromCreationDate: BigInt' : '',
    CollateralValue.value ? '$collateralSearch: [String]' : '',
    (TextToSearch.type === PositionSearchOptions.PositionId ||
      TextToSearch.type === PositionSearchOptions.ConditionId ||
      TextToSearch.type === PositionSearchOptions.WrappedCollateralAddress) &&
    TextToSearch.value
      ? '$textToSearch: String'
      : '',
    TextToSearch.type === PositionSearchOptions.CollateralAddress && TextToSearch.value
      ? '$textToSearch: String'
      : '',
    TextToSearch.type === PositionSearchOptions.CollateralSymbol && TextToSearch.value
      ? '$textToSearch: [String]'
      : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal ? `(${variablesClauseInternal})` : ''

  const query = gql`
  query Positions ${variablesClause} {
    positions(first: 1000 ${whereClause} , orderBy: createTimestamp, orderDirection: desc) {
      ...PositionData
    }
  }
  ${positionFragment}
  `
  return query
}

export const buildQueryPositions = (options: PositionsListType = DEFAULT_OPTIONS) => {
  const { collateral, conditionsIds, positionId } = options

  const whereClauseInternal = [
    conditionsIds && conditionsIds.length ? 'conditionIds_contains: $conditionsIds' : '',
    positionId ? 'id: $positionId' : '',
    collateral ? 'collateralToken: $collateral' : '',
  ]
    .filter((s) => s.length)
    .join(',')
  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    conditionsIds ? '$conditionsIds: [String]' : '',
    positionId ? '$positionId: String' : '',
    collateral ? '$collateral: String' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal ? `(${variablesClauseInternal})` : ''

  const query = gql`
  query Positions ${variablesClause} {
    positions(first: 1000 ${whereClause} , orderBy: createTimestamp, orderDirection: desc) {
      ...PositionData
    }
  }
  ${positionFragment}
  `
  return query
}

export const GetPositionQuery = gql`
  query GetPosition($id: ID!) {
    position(id: $id) {
      ...PositionData
    }
  }
  ${positionFragment}
`

export const GetMultiPositionsQuery = gql`
  query GetMultiPositions($ids: [ID!]!) {
    positions(where: { id_in: $ids }, orderBy: createTimestamp, orderDirection: desc) {
      ...PositionData
    }
  }
  ${positionFragment}
`

export const GetPositionsQuery = gql`
  query GetPositions {
    positions(first: 1000 , orderBy: createTimestamp, orderDirection: desc) {
      ...PositionData
    }
  }
  ${positionFragment}
`
