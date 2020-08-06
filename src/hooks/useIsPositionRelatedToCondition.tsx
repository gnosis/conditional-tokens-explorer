import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { GetPositionQuery } from '../queries/positions'
import { GetPosition } from '../types/generatedGQL'

export const useIsPositionRelatedToCondition = (positionId: string, conditionId: string) => {
  const [isRelated, setIsRelated] = React.useState<boolean>(false)

  const { data: fetchedPosition, error, loading } = useQuery<GetPosition>(GetPositionQuery, {
    variables: { id: positionId },
    fetchPolicy: 'no-cache',
    skip: !positionId || !conditionId,
  })

  React.useEffect(() => {
    if (positionId && conditionId) {
      const { position: positionFromTheGraph } = fetchedPosition ?? { position: null }
      if (positionFromTheGraph) {
        const { collection } = positionFromTheGraph
        // I can use `includes`, but I prefer to check the string with 'toLowerCase' to be more safe
        const conditionsIds = collection.conditionIds.filter(
          (value) => value.toLowerCase() === conditionId.toLowerCase()
        )
        setIsRelated(conditionsIds.length > 0)
      }
    }
  }, [fetchedPosition, positionId, conditionId])

  return {
    isRelated,
    error,
    loading,
  }
}
