import gql from 'graphql-tag'

export const UserWithPositionsQuery = gql`
  query UserWithPositions($account: ID!) {
    user(id: $account) {
      userPositions(first: 1000) {
        id
        position {
          id
        }
        balance
        wrappedBalance
        totalBalance
        user {
          id
        }
      }
    }
  }
`
