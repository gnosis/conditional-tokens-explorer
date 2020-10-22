import gql from 'graphql-tag'

import { AdvancedFilterPosition, PositionSearchOptions, WrappedCollateralOptions, CollateralFilterOptions } from 'util/types'

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
      ? 'id: $textToSearch'
      : '',
    TextToSearch.type === PositionSearchOptions.ConditionId && TextToSearch.value
      ? 'conditionIds_contains: $textToSearch'
      : '',
    (TextToSearch.type === PositionSearchOptions.CollateralSymbol ||
      TextToSearch.type === PositionSearchOptions.CollateralAddress) &&
    TextToSearch.value
      ? 'collateralToken: $textToSearch'
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
    TextToSearch.type === PositionSearchOptions.PositionId && TextToSearch.value
      ? '$textToSearch: ID'
      : '',
    TextToSearch.type === PositionSearchOptions.ConditionId && TextToSearch.value
      ? '$textToSearch: [ID]'
      : '',
    (TextToSearch.type === PositionSearchOptions.CollateralSymbol ||
      TextToSearch.type === PositionSearchOptions.CollateralAddress) &&
    TextToSearch.value
      ? '$textToSearch: ID!'
      : '',
    TextToSearch.type === PositionSearchOptions.WrappedCollateralAddress && TextToSearch.value
      ? '$textToSearch: String'
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
