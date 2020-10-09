import { useQuery } from '@apollo/react-hooks'

import { buildQueryConditionsList } from 'queries/CTEConditions'
import { Conditions } from 'types/generatedGQLForCTE'
import { AdvancedFilter, ConditionType, OracleFilterOptions, StatusOptions } from 'util/types'

/**
 * Return a array of conditions.
 */
export const useConditionsList = (advancedFilter: AdvancedFilter) => {
  const {
    ConditionType: ConditionTypeFilter,
    FromToCreationDate,
    MaxOutcomes,
    MinOutcomes,
    ReporterOracle,
    Status,
    TextToSearch,
  } = advancedFilter

  const query = buildQueryConditionsList(advancedFilter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variables: { [k: string]: any } = {}
  if (ReporterOracle.type === OracleFilterOptions.Custom)
    variables['oracleNotIn'] = ReporterOracle.value
  if (
    ReporterOracle.type === OracleFilterOptions.Current ||
    ReporterOracle.type === OracleFilterOptions.Kleros ||
    ReporterOracle.type === OracleFilterOptions.Realitio
  )
    variables['oracleIn'] = ReporterOracle.value
  if (Status === StatusOptions.Open) variables['resolved'] = false
  if (Status === StatusOptions.Resolved) variables['resolved'] = true
  if (MinOutcomes) variables['minOutcome'] = MinOutcomes
  if (MaxOutcomes) variables['maxOutcome'] = MaxOutcomes
  if (FromToCreationDate) {
    variables['fromCreationDate'] = FromToCreationDate.from
    variables['toCreationDate'] = FromToCreationDate.to
  }
  if (
    ConditionTypeFilter.type === ConditionType.omen ||
    ConditionTypeFilter.type === ConditionType.custom
  ) {
    variables['conditionType'] = ConditionTypeFilter.value
  }
  if (TextToSearch.value) {
    variables['textToSearch'] = TextToSearch.value.toLowerCase()
  }

  const { data, error, loading } = useQuery<Conditions>(query, {
    variables: variables,
    fetchPolicy: 'no-cache',
  })

  return {
    data,
    error,
    loading,
  }
}
