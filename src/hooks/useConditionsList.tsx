import { useQuery } from '@apollo/react-hooks'

import { buildQueryConditionsList } from 'queries/CTEConditions'
import { Conditions } from 'types/generatedGQLForCTE'
import { OracleFilterOptions, StatusOptions, AdvancedFilter } from 'util/types'

/**
 * Return a array of conditions.
 */
export const useConditionsList = (advancedFilter: AdvancedFilter) => {
  const { ReporterOracle, Status, MinMaxOutcomes } = advancedFilter

  const query = buildQueryConditionsList(advancedFilter)

  let variables: {[k: string]: any}  = {}
  if(ReporterOracle.type === OracleFilterOptions.Custom) variables['oracleNotIn'] = ReporterOracle.value
  if(ReporterOracle.type === OracleFilterOptions.Current || ReporterOracle.type === OracleFilterOptions.Kleros || ReporterOracle.type === OracleFilterOptions.Realitio) variables['oracleIn'] = ReporterOracle.value
  if(Status === StatusOptions.Open) variables['resolved'] = false
  if(Status === StatusOptions.Resolved) variables['resolved'] = true
  if(MinMaxOutcomes) {
    variables['minOutcome'] = MinMaxOutcomes.min
    variables['maxOutcome'] = MinMaxOutcomes.max
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
