import gql from 'graphql-tag'

import {
  AdvancedFilter,
  ConditionSearchOptions,
  ConditionType,
  ConditionTypeAll,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'

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
  MinOutcomes: null,
  MaxOutcomes: null,
  FromCreationDate: null,
  ToCreationDate: null,
  TextToSearch: {
    type: ConditionSearchOptions.All,
    value: null,
  },
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
    FromCreationDate,
    MaxOutcomes,
    MinOutcomes,
    ReporterOracle,
    Status,
    TextToSearch,
    ToCreationDate,
  } = advancedFilter

  const whereClauseInternal = [
    ReporterOracle.type === OracleFilterOptions.Custom ? 'oracle_not_in: $oracleNotIn' : '',
    ReporterOracle.type === OracleFilterOptions.Current ||
    ReporterOracle.type === OracleFilterOptions.Kleros ||
    ReporterOracle.type === OracleFilterOptions.Realitio
      ? 'oracle_in: $oracleIn'
      : '',
    Status === StatusOptions.Open || Status === StatusOptions.Resolved ? 'resolved: $resolved' : '',
    MaxOutcomes ? 'outcomeSlotCount_lte: $maxOutcome' : '',
    MinOutcomes ? 'outcomeSlotCount_gte: $minOutcome' : '',
    ToCreationDate ? 'createTimestamp_lte: $toCreationDate' : '',
    FromCreationDate ? 'createTimestamp_gte: $fromCreationDate' : '',
    ConditionTypeFilter.type === ConditionType.omen ? 'oracle: $conditionType' : '',
    ConditionTypeFilter.type === ConditionType.custom ? 'oracle_not: $conditionType' : '',
    TextToSearch.type === ConditionSearchOptions.ConditionId && TextToSearch.value
      ? 'id: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.QuestionId && TextToSearch.value
      ? 'questionId: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.OracleAddress && TextToSearch.value
      ? 'oracle: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.CreatorAddress && TextToSearch.value
      ? 'creator: $textToSearch'
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
    MinOutcomes ? '$minOutcome: Int' : '',
    MaxOutcomes ? '$maxOutcome: Int' : '',
    ToCreationDate ? '$toCreationDate: BigInt' : '',
    FromCreationDate ? '$fromCreationDate: BigInt' : '',
    ConditionTypeFilter.type === ConditionType.omen ||
    ConditionTypeFilter.type === ConditionType.custom
      ? '$conditionType: Bytes'
      : '',
    TextToSearch.type === ConditionSearchOptions.ConditionId && TextToSearch.value
      ? '$textToSearch: ID'
      : '',
    (TextToSearch.type === ConditionSearchOptions.QuestionId ||
      TextToSearch.type === ConditionSearchOptions.OracleAddress ||
      TextToSearch.type === ConditionSearchOptions.CreatorAddress) &&
    TextToSearch.value
      ? '$textToSearch: Bytes'
      : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal ? `(${variablesClauseInternal})` : ''

  const query = gql`
      query ConditionsList ${variablesClause} {
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
