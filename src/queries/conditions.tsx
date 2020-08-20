import gql from 'graphql-tag'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_ORDER_FIELD = 'resolveBlockNumber'

export const ConditionsSearchQuery = gql`
  query Conditions($conditionId: String!) {
    conditions(
      first: 1000
      where: { id: $conditionId }
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
    conditions(first: 1000, orderBy: $DEFAULT_ORDER_FIELD, orderDirection: desc) {
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
