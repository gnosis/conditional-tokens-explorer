import gql from 'graphql-tag'

import {
  AdvancedFilter,
  ConditionType,
  ConditionTypeAll,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'
import { ConditionSearchOptions } from '../util/types'

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
    value: [],
  },
  ConditionType: {
    type: ConditionTypeAll.all,
    value: null,
  },
  Status: StatusOptions.All,
  MinMaxOutcomes: null,
  FromToCreationDate: null,
  TextToSearch: {
    type: ConditionSearchOptions.All,
    value: null,
  }
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
  const {
    ConditionType: ConditionTypeFilter,
    FromToCreationDate,
    MinMaxOutcomes,
    ReporterOracle,
    Status,
    TextToSearch,
  } = advancedFilter

  const whereClauseInternal = [
    ReporterOracle.type === OracleFilterOptions.Custom ? 'oracle_not_in: $oracleNotIn' : '',
    ReporterOracle.type === OracleFilterOptions.Current ||
    ReporterOracle.type === OracleFilterOptions.Kleros ||
    ReporterOracle.type === OracleFilterOptions.Realitio
      ? 'oracle_in: $oracleIn'
      : '',
    Status === StatusOptions.Open || Status === StatusOptions.Resolved ? 'resolved: $resolved' : '',
    MinMaxOutcomes ? 'outcomeSlotCount_lte: $maxOutcome , outcomeSlotCount_gte: $minOutcome' : '',
    FromToCreationDate
      ? 'createTimestamp_lte: $toCreationDate , createTimestamp_gte: $fromCreationDate'
      : '',
    ConditionTypeFilter.type === ConditionType.omen ||
    ConditionTypeFilter.type === ConditionType.custom
      ? 'oracle: $conditionType'
      : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    ReporterOracle.type === OracleFilterOptions.Custom ? '$oracleNotIn: [String]' : '',
    ReporterOracle.type === OracleFilterOptions.Current ||
    ReporterOracle.type === OracleFilterOptions.Kleros ||
    ReporterOracle.type === OracleFilterOptions.Realitio
      ? '$oracleIn: [String]'
      : '',
    Status === StatusOptions.Open || Status === StatusOptions.Resolved ? '$resolved: Boolean' : '',
    MinMaxOutcomes ? '$maxOutcome: Int,$minOutcome: Int' : '',
    FromToCreationDate ? '$toCreationDate: BigInt,$fromCreationDate: BigInt' : '',
    ConditionTypeFilter.type === ConditionType.omen ||
    ConditionTypeFilter.type === ConditionType.custom
      ? '$conditionType: Bytes'
      : '',
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
