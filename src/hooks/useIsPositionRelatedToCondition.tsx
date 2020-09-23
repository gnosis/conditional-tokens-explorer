import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { GetPositionQuery } from 'queries/positions'
import { GetPosition } from 'types/generatedGQL'

export const useIsPositionRelatedToCondition = (positionId: string, conditionId: string) => {
  const { data: fetchedPosition, error, loading } = useQuery<GetPosition>(GetPositionQuery, {
    variables: { id: positionId },
    fetchPolicy: 'no-cache',
    skip: !positionId || !conditionId,
  })

  const isRelated = React.useMemo(() => {
    if (positionId && conditionId) {
      const { position: positionFromTheGraph } = fetchedPosition ?? { position: null }
      if (positionFromTheGraph) {
        const { conditionIds } = positionFromTheGraph
        return conditionIds.includes(conditionId.toLowerCase())
      }
    } else {
      return true
    }
  }, [fetchedPosition, positionId, conditionId])

  return {
    isRelated,
    error,
    loading,
  }
}
