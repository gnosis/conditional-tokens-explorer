import gql from 'graphql-tag'

export interface ConditionsListType {
  conditionId?: string
  oracleIn?: string[]
  oracleNotIn?: string[]
}

export const DEFAULT_OPTIONS = {
  conditionId: '',
  oracleIn: [],
  oracleNotIn: [],
}

export const buildQueryConditions = (options: ConditionsListType = DEFAULT_OPTIONS) => {
  const { conditionId, oracleIn, oracleNotIn } = options

  const whereClauseInternal = [
    conditionId ? 'id: $conditionId' : '',
    oracleIn && oracleIn.length > 0 ? 'oracle_in: $oracleIn' : '',
    oracleNotIn && oracleNotIn.length > 0 ? 'oracle_not_in: $oracleNotIn' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    conditionId ? '$conditionId: String' : '',
    oracleIn && oracleIn.length > 0 ? '$oracleIn: [String]' : '',
    oracleNotIn && oracleNotIn.length > 0 ? '$oracleNotIn: [String]' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal ? `(${variablesClauseInternal})` : ''

  const query = gql`
      query Conditions ${variablesClause} {
        conditions(first: 1000 ${whereClause} , orderBy: createTimestamp, orderDirection: desc) {
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
      resolveBlockNumber
      positions {
        id
        collateralToken {
          id
        }
      }
    }
  }
`
