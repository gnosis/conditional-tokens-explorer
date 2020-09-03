import gql from 'graphql-tag'

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

export const PositionsSearchQuery = gql`
  query PositionsSearch($positionId: String!) {
    positions(first: 1000, where: { id: $positionId }) {
      id
      collateralToken {
        id
      }
    }
  }
`

export const PositionsListQuery = gql`
  query Positions {
    positions(first: 1000) {
      id
      collateralToken {
        id
      }
    }
  }
`
