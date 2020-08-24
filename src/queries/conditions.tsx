import gql from 'graphql-tag'

export const ConditionsSearchQuery = gql`
  query ConditionsSearch($conditionId: String!) {
    conditions(first: 1000, where: { id: $conditionId }) {
      id
      oracle
      questionId
      outcomeSlotCount
      resolved
      creator
      resolveBlockNumber
    }
  }
`

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
      payoutNumerators
      payoutDenominator
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
