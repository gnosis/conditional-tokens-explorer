import { isPositionIdValid } from 'util/tools'
import { Errors, PositionErrors } from 'util/types'

import { useQuery } from '@apollo/react-hooks'
import { useErrors } from 'hooks/useErrors'
import { GetMultiPositionsQuery } from 'queries/positions'
import React, { useCallback, useEffect, useState } from 'react'

import { GetMultiPositions, GetMultiPositions_positions } from '../types/generatedGQL'

export interface MultiPositionsContext {
  positions: Array<GetMultiPositions_positions>
  positionIds: Array<string>
  loading: boolean
  errors: Errors[]
  addPositionId: (positionId: string) => void
  updatePositionIds: (positionIds: Array<string>) => void
  removePositionId: (positionId: string) => void
  clearPositions: () => void
}

export const MULTI_POSITION_CONTEXT_DEFAULT_VALUE = {
  positions: [],
  positionIds: [],
  loading: false,
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addPositionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updatePositionIds: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearPositions: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removePositionId: () => {},
}

const MultiPositionsContext = React.createContext<MultiPositionsContext>(
  MULTI_POSITION_CONTEXT_DEFAULT_VALUE
)

interface Props {
  children: React.ReactNode
}

export const MultiPositionsProvider = (props: Props) => {
  const [positionIds, setPositionIds] = useState<Array<string>>([])
  const [positions, setPositions] = useState<Array<GetMultiPositions_positions>>([])

  const { clearErrors, errors, pushError, removeError } = useErrors()

  const updatePositionIds = useCallback(
    (positionIds: Array<string>): void => {
      clearErrors()
      if (!positionIds.every((positionId) => isPositionIdValid(positionId))) {
        pushError(PositionErrors.INVALID_ERROR)
      }

      setPositionIds(positionIds)
    },
    [clearErrors, pushError]
  )

  const addPositionId = useCallback(
    (positionId: string): void => {
      console.log('positionId', positionId)
      clearErrors()
      if (!isPositionIdValid(positionId)) {
        pushError(PositionErrors.INVALID_ERROR)
      }
      const positionIdLc = positionId.toLowerCase()
      setPositionIds((current) => {
        return current.includes(positionIdLc) ? current : [...current, positionIdLc]
      })
    },
    [clearErrors, pushError]
  )

  const removePositionId = useCallback((positionId: string): void => {
    let clearPositions = false
    setPositionIds((current) => {
      const next = current.filter((id) => id !== positionId.toLowerCase())
      if (!next.length) {
        clearPositions = true
      }
      return next
    })
    if (clearPositions) {
      setPositions([])
    }
  }, [])

  const clearPositions = useCallback((): void => {
    clearErrors()
    setPositionIds([])
    setPositions([])
  }, [clearErrors])

  const { data: fetchedPositions, error: errorFetchingPositions, loading: loadingQuery } = useQuery<
    GetMultiPositions
  >(GetMultiPositionsQuery, {
    variables: { ids: positionIds },
    fetchPolicy: 'no-cache',
    skip: !positionIds.length,
  })

  useEffect(() => {
    removeError(PositionErrors.NOT_FOUND_ERROR)
    const { positions: positionsFromTheGraph } = fetchedPositions ?? { positions: [] }
    if (!loadingQuery && positionsFromTheGraph.length) {
      setPositions(positionsFromTheGraph)
    }

    // Validate all positions exist
    if (positionIds.length && !loadingQuery && positionsFromTheGraph.length < positionIds.length) {
      pushError(PositionErrors.NOT_FOUND_ERROR)
    }
  }, [fetchedPositions, positionIds, loadingQuery, removeError, pushError])

  useEffect(() => {
    removeError(PositionErrors.FETCHING_ERROR)
    if (errorFetchingPositions) {
      pushError(PositionErrors.FETCHING_ERROR)
    }
  }, [errorFetchingPositions, pushError, removeError])

  const value = {
    positions,
    positionIds,
    errors,
    loading: loadingQuery,
    addPositionId,
    updatePositionIds,
    removePositionId,
    clearPositions,
    setPositions,
  }

  return (
    <MultiPositionsContext.Provider value={value}>{props.children}</MultiPositionsContext.Provider>
  )
}

export const useMultiPositionsContext = (): MultiPositionsContext => {
  return React.useContext(MultiPositionsContext)
}
