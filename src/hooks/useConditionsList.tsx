import { useQuery } from '@apollo/react-hooks'

import { buildQueryConditionsList } from 'queries/CTEConditions'
import { Conditions } from 'types/generatedGQLForCTE'
import { AdvancedFilter, OracleFilterOptions, StatusOptions } from 'util/types'

/**
 * Return a array of conditions.
 */
export const useConditionsList = (advancedFilter: AdvancedFilter) => {
  const { FromToCreationDate, MinMaxOutcomes, ReporterOracle, Status } = advancedFilter

  const query = buildQueryConditionsList(advancedFilter)

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
  if (MinMaxOutcomes) {
    variables['minOutcome'] = MinMaxOutcomes.min
    variables['maxOutcome'] = MinMaxOutcomes.max
  }
  if (FromToCreationDate) {
    variables['fromCreationDate'] = FromToCreationDate.from
    variables['toCreationDate'] = FromToCreationDate.to
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
