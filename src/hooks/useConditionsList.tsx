import { useMemo } from 'react'

import { useQueryTotalResults } from 'hooks/useQueryTotalResults'
import { buildQueryConditionsList } from 'queries/CTEConditions'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import {
  AdvancedFilterConditions,
  ConditionType,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Variables = { [k: string]: any }
/**
 * Return a array of conditions.
 */
export const useConditionsList = (advancedFilter: AdvancedFilterConditions) => {
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

  const query = buildQueryConditionsList(advancedFilter)
  const variables = useMemo(() => {
    const variables: Variables = {}

    if (ReporterOracle.type === OracleFilterOptions.Custom) {
      variables['oracleNotIn'] = ReporterOracle.value
    }
    if (
      ReporterOracle.type === OracleFilterOptions.Current ||
      ReporterOracle.type === OracleFilterOptions.Kleros ||
      ReporterOracle.type === OracleFilterOptions.Reality
    ) {
      variables['oracleIn'] = ReporterOracle.value
    }
    if (Status === StatusOptions.Open) variables['resolved'] = false
    if (Status === StatusOptions.Resolved) variables['resolved'] = true
    if (MinOutcomes) variables['minOutcome'] = MinOutcomes
    if (MaxOutcomes) variables['maxOutcome'] = MaxOutcomes
    if (FromCreationDate) variables['fromCreationDate'] = FromCreationDate
    if (ToCreationDate) variables['toCreationDate'] = ToCreationDate
    if (
      ConditionTypeFilter.type === ConditionType.omen ||
      ConditionTypeFilter.type === ConditionType.custom
    ) {
      variables['conditionType'] = ConditionTypeFilter.value
    }
    if (TextToSearch.value) {
      variables['textToSearch'] = TextToSearch.value.toLowerCase()
    }

    return variables
  }, [
    ConditionTypeFilter.type,
    ConditionTypeFilter.value,
    FromCreationDate,
    MaxOutcomes,
    MinOutcomes,
    ReporterOracle.type,
    ReporterOracle.value,
    Status,
    TextToSearch.value,
    ToCreationDate,
  ])

  const { data, error, loading, refetch } = useQueryTotalResults<Conditions_conditions, Variables>({
    query,
    fetchPolicy: 'no-cache',
    variables,
    entityName: 'conditions',
  })

  return {
    data,
    error,
    loading,
    refetch,
  }
}
