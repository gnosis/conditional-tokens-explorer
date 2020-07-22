import gql from 'graphql-tag'

export const fetchPosition = gql`
  query fetchPosition($id: ID!) {
    position(id: $id) {
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
