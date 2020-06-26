import gql from 'graphql-tag'

export const UserWithPositionsQuery = gql`
  query UserWithPositions($account: Bytes!) {
    user(id: $account) {
      userPositions {
        id
        position {
          id
        }
        balance
      }
    }
  }
`
