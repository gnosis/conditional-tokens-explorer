import gql from 'graphql-tag'

const DEFAULT_ORDER_FIELD = 'resolveBlockNumber'

export const ConditionsSearchQuery = gql`
  query Conditions($oracle: String!) {
    conditions(
      first: 1000
      where: { oracle: $oracle }
      orderBy: $DEFAULT_ORDER_FIELD
      orderDirection: desc
    ) {
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
