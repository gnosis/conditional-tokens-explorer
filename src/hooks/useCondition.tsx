import { useQuery } from '@apollo/react-hooks'

import { GetConditionQuery } from 'queries/CTEConditions'

export const useCondition = (conditionId: Maybe<string>) => {
  const { data } = useQuery(GetConditionQuery, {
    variables: {
      id: conditionId,
    },
    fetchPolicy: 'no-cache',
  })

  return data?.condition
}
