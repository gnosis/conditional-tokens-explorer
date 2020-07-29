import gql from 'graphql-tag'

export const GetPositionQuery = gql`
  query GetPosition($id: ID!) {
    position(id: $id) {
      id
      indexSets
      activeValue
      collateralToken {
        id
      }
      collection {
        id
        conditionIds
        indexSets
        positions {
          id
        }
      }
      conditions {
        id 
        outcomeSlotCount
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
