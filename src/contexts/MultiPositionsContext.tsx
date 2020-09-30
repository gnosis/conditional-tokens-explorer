import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'

import { useErrors } from 'hooks/useErrors'
import { GetMultiPositionsQuery } from 'queries/CTEPositions'
import { GetMultiPositions, GetMultiPositions_positions } from 'types/generatedGQLForCTE'
import { isPositionIdValid } from 'util/tools'
import { Errors, PositionErrors } from 'util/types'

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

const isLoading = (
  loadingQuery: boolean,
  positions: GetMultiPositions_positions[],
  positionIds: string[]
) => {
  return (
    loadingQuery ||
    positions.length !== positionIds.length ||
    JSON.stringify(positions.map(({ id }) => id).sort()) !== JSON.stringify([...positionIds].sort())
  )
}

export const MultiPositionsProvider = (props: Props) => {
  const [positionIds, setPositionIds] = useState<Array<string>>([])
  const [positions, setPositions] = useState<Array<GetMultiPositions_positions>>([])
  const { clearErrors, errors, pushError, removeError } = useErrors()

  const clearPositions = useCallback((): void => {
    clearErrors()
    setPositionIds([])
    setPositions([])
  }, [clearErrors])

  const updatePositionIds = useCallback(
    (positionIds: Array<string>): void => {
      clearErrors()
      if (!positionIds.every((positionId) => isPositionIdValid(positionId))) {
        pushError(PositionErrors.INVALID_ERROR)
      }
      if (positionIds.length) {
        setPositionIds(positionIds)
      } else {
        clearPositions()
      }
    },
    [clearErrors, pushError, clearPositions]
  )

  const addPositionId = useCallback(
    (positionId: string): void => {
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

  const removePositionId = useCallback(
    (positionId: string): void => {
      let clearPositionsFlag = false
      setPositionIds((current) => {
        const next = current.filter((id) => id.toLowerCase() !== positionId.toLowerCase())
        clearPositionsFlag = next.length === 0
        return next
      })

      if (clearPositionsFlag) {
        clearPositions()
      }
    },
    [clearPositions]
  )

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
    loading: isLoading(loadingQuery, positions, positionIds),
    addPositionId,
    updatePositionIds,
    removePositionId,
    clearPositions,
  }

  return (
    <MultiPositionsContext.Provider value={value}>{props.children}</MultiPositionsContext.Provider>
  )
}

export const useMultiPositionsContext = (): MultiPositionsContext => {
  return React.useContext(MultiPositionsContext)
}
