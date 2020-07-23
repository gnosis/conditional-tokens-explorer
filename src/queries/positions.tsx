import gql from 'graphql-tag'

export const GetPositionQuery = gql`
  query GetPosition($id: ID!) {
    position(id: $id) {
      id
      collateralToken {
        id
      }
      collection {
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
