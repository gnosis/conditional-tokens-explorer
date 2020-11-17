import gql from 'graphql-tag'

export const queryGetOmenMarketsByConditionID = gql`
  query GetOmenMarketsByConditionID($id: ID!) {
    condition(id: $id) {
      fixedProductMarketMakers {
        id
        question {
          title
        }
      }
    }
  }
`
