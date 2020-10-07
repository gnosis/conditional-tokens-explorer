import gql from 'graphql-tag'
import { OracleFilterOptions, AdvancedFilter, StatusOptions } from 'util/types'

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

export const DEFAULT_OPTIONS_LIST: AdvancedFilter = {
  ReporterOracle: {
    type: OracleFilterOptions.All,
    value: []
  },
  Status: StatusOptions.All,
  MinMaxOutcomes: null
}

const conditionFragment = gql`
  fragment ConditionData on Condition {
    id
    oracle
    questionId
    outcomeSlotCount
    resolved
    creator
    payouts
    createTimestamp
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
`
export const buildQueryConditionsList = (advancedFilter: AdvancedFilter = DEFAULT_OPTIONS_LIST) => {
  const { ReporterOracle, Status, MinMaxOutcomes } = advancedFilter

  const whereClauseInternal = [
    ReporterOracle.type === OracleFilterOptions.Custom ? 'oracle_not_in: $oracleNotIn' : '',
    ReporterOracle.type === OracleFilterOptions.Current || ReporterOracle.type === OracleFilterOptions.Kleros || ReporterOracle.type === OracleFilterOptions.Realitio ? 'oracle_in: $oracleIn' : '',
    Status === StatusOptions.Open || Status === StatusOptions.Resolved ? 'resolved: $resolved' : '',
    MinMaxOutcomes ? 'outcomeSlotCount_lte: $maxOutcome , outcomeSlotCount_gte: $minOutcome' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    ReporterOracle.type === OracleFilterOptions.Custom ? '$oracleNotIn: [String]' : '',
    ReporterOracle.type === OracleFilterOptions.Current || ReporterOracle.type === OracleFilterOptions.Kleros || ReporterOracle.type === OracleFilterOptions.Realitio ? '$oracleIn: [String]' : '',
    Status === StatusOptions.Open || Status === StatusOptions.Resolved ? '$resolved: Boolean' : '',
    MinMaxOutcomes ? '$maxOutcome: Int,$minOutcome: Int' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal ? `(${variablesClauseInternal})` : ''

  const query = gql`
      query Conditions ${variablesClause} {
        conditions(first: 1000 ${whereClause} , orderBy: createTimestamp, orderDirection: desc) {
          ...ConditionData
        }
      }
      ${conditionFragment}
  `

  return query
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
          ...ConditionData
        }
      }
      ${conditionFragment}
  `

  return query
}

export const GetConditionQuery = gql`
  query GetCondition($id: ID!) {
    condition(id: $id) {
      ...ConditionData
    }
  }
  ${conditionFragment}
`
