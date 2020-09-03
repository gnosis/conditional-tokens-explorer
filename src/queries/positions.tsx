import gql from 'graphql-tag'

export interface BuildQueryPositionsListType {
  positionId: string
  collateral?: string
}

export const DEFAULT_OPTIONS = {
  positionId: '',
  collateral: '',
}

export const buildQueryPositions = (options: BuildQueryPositionsListType = DEFAULT_OPTIONS) => {
  const { collateral, positionId } = options

  const whereClause = [
    positionId ? 'id: $positionId' : '',
    collateral ? 'collateralToken: $collateral' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const query = gql`
  query PositionsSearch($positionId: String!, $collateral: String!) {
    positions(first: 1000, where: { ${whereClause} }) {
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
