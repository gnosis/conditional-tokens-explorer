import gql from 'graphql-tag'

export const ConditionsListQuery = gql`
  query Conditions {
    conditions(first: 1000) {
      id
      oracle
      questionId
      outcomeSlotCount
      resolved
      creator
    }
  }
`

export const GetConditionQuery = gql`
  query GetCondition($id: ID!) {
    condition(id: $id) {
      id
      oracle
      questionId
      outcomeSlotCount
      resolved
      creator
      payouts
      resolveTimestamp
      positions {
        id
        collateralToken {
          id
        }
      }
    }
  }
`
