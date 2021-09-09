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
  query UserPositionBalances($account: String, $positionId: String) {
    userPositions(where: { position: $positionId, user: $account }) {
      id
      position {
        id
        collateralToken {
          id
        }
        wrappedTokenAddress
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
