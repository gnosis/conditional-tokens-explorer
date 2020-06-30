import gql from 'graphql-tag'

export const ConditionsListQuery = gql`
  query Conditions {
    conditions(first: 1000) {
      id
      oracle
      questionId
      outcomeSlotCount
      resolved
    }
  }
`
