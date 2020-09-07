import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { GetPositionQuery } from 'queries/positions'
import { GetPosition } from 'types/generatedGQL'

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
        const { conditionIds } = positionFromTheGraph
        setIsRelated(conditionIds.includes(conditionId.toLowerCase()))
      }
    }
  }, [fetchedPosition, positionId, conditionId])

  return {
    isRelated,
    error,
    loading,
  }
}
