import gql from 'graphql-tag'

export const UserWithPositionsQuery = gql`
  query UserWithPositions($account: ID!) {
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
