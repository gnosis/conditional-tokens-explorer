import { useQuery } from '@apollo/react-hooks'

import { ConditionsListType, buildQueryConditions } from 'queries/CTEConditions'
import { Conditions } from 'types/generatedGQLForCTE'
import { OracleFilterOptions } from 'util/types'

interface OptionsToSearch {
  conditionId?: string
  oracleValue?: OracleFilterOptions
  oracleFilter?: string[]
}

/**
 * Return a array of conditions.
 */
export const useConditions = (options: OptionsToSearch) => {
  const { conditionId, oracleFilter, oracleValue } = options

  const queryOptions: ConditionsListType = {}

  if (conditionId) {
    queryOptions.conditionId = conditionId
  }

  if (oracleValue === OracleFilterOptions.Custom) {
    queryOptions.oracleNotIn = oracleFilter
  }

  if (
    oracleValue &&
    [OracleFilterOptions.Kleros, OracleFilterOptions.Reality].indexOf(oracleValue) > -1
  ) {
    queryOptions.oracleIn = oracleFilter
  }

  const query = buildQueryConditions(queryOptions)

  const { data, error, loading } = useQuery<Conditions>(query, {
    variables: queryOptions,
    fetchPolicy: 'no-cache',
  })

  return {
    data,
    error,
    loading,
  }
}
