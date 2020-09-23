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

export const UserPositionBalancesQuery = gql`
  query UserPositionBalances($account: ID, $positionId: ID) {
    userPositions(where: { position: $positionId, user: $account }) {
      id
      position {
        id
        collateralToken {
          id
        }
        wrappedToken {
          id
        }
      }
      balance
      wrappedBalance
      totalBalance
      user {
        id
      }
    }
  }
`
