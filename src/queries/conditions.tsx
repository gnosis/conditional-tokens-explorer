import gql from 'graphql-tag'

export interface BuildQueryType {
  conditionId: string
  oracleIn?: string[]
  oracleNotIn?: string[]
}

export const DEFAULT_OPTIONS = {
  conditionId: '',
  oracleIn: [],
  oracleNotIn: [],
}

export const buildQueryConditions = (options: BuildQueryType = DEFAULT_OPTIONS) => {
  const { conditionId, oracleIn, oracleNotIn } = options

  const whereClause = [
    conditionId ? 'id: $conditionId' : '',
    oracleIn && oracleIn.length > 0 ? 'oracle_in: $oracleIn' : '',
    oracleNotIn && oracleNotIn.length > 0 ? 'oracle_not_in: $oracleNotIn' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const query = gql`
      query ConditionsSearch($conditionId: String!, $oracleIn: [String!]!, $oracleNotIn: [String!]!) {
        conditions(first: 1000,  where: { ${whereClause} }) {
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
  return query
}

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
