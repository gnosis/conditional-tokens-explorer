import gql from 'graphql-tag'

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
