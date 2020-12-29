import gql from 'graphql-tag'

import {
  AdvancedFilterConditions,
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

export const DEFAULT_OPTIONS_LIST: AdvancedFilterConditions = {
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
    type: ConditionSearchOptions.ConditionId,
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
    title
  }
`
export const buildQueryConditionsList = (
  advancedFilter: AdvancedFilterConditions = DEFAULT_OPTIONS_LIST
) => {
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
    ReporterOracle.type === OracleFilterOptions.Reality
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
      ? 'conditionId_contains: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.QuestionId && TextToSearch.value
      ? 'questionId_contains: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.QuestionText && TextToSearch.value
      ? 'title_contains: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.OracleAddress && TextToSearch.value
      ? 'oracle_contains: $textToSearch'
      : '',
    TextToSearch.type === ConditionSearchOptions.CreatorAddress && TextToSearch.value
      ? 'creator_contains: $textToSearch'
      : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const whereClause = whereClauseInternal ? `, where: { ${whereClauseInternal} }` : ''

  const variablesClauseInternal = [
    ReporterOracle.type === OracleFilterOptions.Custom ? '$oracleNotIn: [String]' : '',
    ReporterOracle.type === OracleFilterOptions.Current ||
    ReporterOracle.type === OracleFilterOptions.Kleros ||
    ReporterOracle.type === OracleFilterOptions.Reality
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
    TextToSearch.value ? '$textToSearch: String' : '',
  ]
    .filter((s) => s.length)
    .join(',')

  const variablesClause = variablesClauseInternal
    ? `($first: Int!, $skip: Int!, ${variablesClauseInternal})`
    : '($first: Int!, $skip: Int!)'

  const query = gql`
      query ConditionsList ${variablesClause} {
        conditions(first: $first, skip: $skip${whereClause}, orderBy: createTimestamp, orderDirection: desc) {
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
