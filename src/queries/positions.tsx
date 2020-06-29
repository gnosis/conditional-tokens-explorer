import gql from 'graphql-tag'

export const fetchPosition = gql`
  query fetchPosition($id: String) {
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
