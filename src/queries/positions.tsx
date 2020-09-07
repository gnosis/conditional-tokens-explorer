import gql from 'graphql-tag'

export interface PositionsListType {
  positionId?: string
  collateral?: string
}

export const DEFAULT_OPTIONS = {
  positionId: '',
  collateral: '',
}

export const buildQueryPositions = (options: PositionsListType = DEFAULT_OPTIONS) => {
  const { collateral, positionId } = options

  const whereClauseInternal = [
    positionId ? 'id: $positionId' : '',
    collateral ? 'collateralToken: $collateral' : '',
  ]
    .filter((s) => s.length)
    .join(',')
  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    positionId ? '$positionId: String' : '',
    collateral ? '$collateral: String' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal ? `(${variablesClauseInternal})` : ''

  const query = gql`
  query Positions ${variablesClause} {
    positions(first: 1000 ${whereClause}) {
      id
      collateralToken {
        id
      }
    }
  }
  `
  return query
}

const positionFragment = gql`
  fragment PositionData on Position {
    id
    indexSets
    activeValue
    collateralToken {
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
      outcomeSlotCount
    }
  }
`

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
    positions(where: { id_in: $ids }) {
      ...PositionData
    }
  }
  ${positionFragment}
`
