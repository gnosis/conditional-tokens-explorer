import gql from 'graphql-tag'

export const ConditionsList = gql`
  query ConditionList {
    conditions(first: 1000) {
      id
      oracle
      questionId
      outcomeSlotCount
    }
  }
`
