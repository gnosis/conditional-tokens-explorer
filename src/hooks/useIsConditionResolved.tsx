import { useQuery } from '@apollo/react-hooks'
import { useMemo } from 'react'

import { GetConditionQuery } from 'queries/CTEConditions'

export const useIsConditionResolved = (conditionId: Maybe<string>) => {
  const { data } = useQuery(GetConditionQuery, {
    variables: {
      id: conditionId,
    },
    fetchPolicy: 'no-cache',
  })

  return useMemo(
    () => (data && conditionId ? !!data.condition.resolved : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, conditionId]
  )
}
