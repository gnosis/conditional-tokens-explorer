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

export const ConditionQuery = (conditionId: string) => {
  const query = gql`
  query Conditions {
    conditions(where: {id:"${conditionId}"}) {
      id
      oracle
      questionId
      outcomeSlotCount
      resolved
      creator
    }
  }
  `
  return query
}
