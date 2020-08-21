import gql from 'graphql-tag'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_ORDER_FIELD = 'resolveBlockNumber'

const postitionFragment = gql`
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
  ${postitionFragment}
`

export const GetMultiPositionsQuery = gql`
  query GetMultiPositions($ids: [ID!]!) {
    positions(where: { id_in: $ids }) {
      ...PositionData
    }
  }
  ${postitionFragment}
`

export const PositionsSearchQuery = gql`
  query Positions($positionId: String!) {
    positions(
      first: 1000
      where: { id: $positionId }
      orderBy: $DEFAULT_ORDER_FIELD
      orderDirection: desc
    ) {
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
