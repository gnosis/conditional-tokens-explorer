import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useState } from 'react'

import { useBalanceForMultiPosition } from '../hooks/useBalanceForMultiPosition'
import { GetMultiPositionsQuery } from '../queries/positions'
import { GetMultiPositions, GetMultiPositions_positions } from '../types/generatedGQL'
import { isPositionIdValid } from '../util/tools'
import { PositionErrors } from '../util/types'

const BIG_ZERO = new BigNumber(0)

export interface MultiPositionsContext {
  positions: Array<GetMultiPositions_positions>
  positionIds: Array<string>
  loading: boolean
  errors: PositionErrors[]
  balances: BigNumber[]
  addPositionId: (positionId: string) => void
  removePositionId: (positionId: string) => void
  clearPositions: () => void
}

export const MULTI_POSITION_CONTEXT_DEFAULT_VALUE = {
  positions: [],
  positionIds: [],
  loading: false,
  errors: [],
  balances: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addPositionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearPositions: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removePositionId: () => {},
}

const MultiPositionsContext = React.createContext<MultiPositionsContext>(
  MULTI_POSITION_CONTEXT_DEFAULT_VALUE
)

interface Props {
  checkForEmptyBalance?: boolean
  children: React.ReactNode
}

export const MultiPositionsProvider = (props: Props) => {
  const { checkForEmptyBalance } = props
  const [positionIds, setPositionIds] = useState<Array<string>>([])
  const [positions, setPositions] = useState<Array<GetMultiPositions_positions>>([])

  const errors: any[] = []

  const addPositionId = useCallback((positionId: string): void => {
    const positionIdLc = positionId.toLowerCase()
    setPositionIds((current) => {
      return current.includes(positionIdLc) ? current : [...current, positionIdLc]
    })
  }, [])

  const removePositionId = useCallback((positionId: string): void => {
    setPositionIds((current) => current.filter((id) => id !== positionId.toLowerCase()))
  }, [])

  const clearPositions = useCallback((): void => {
    setPositionIds([])
    setPositions([])
  }, [])

  const { data: fetchedPositions, error: errorFetchingPositions, loading: loadingQuery } = useQuery<
    GetMultiPositions
  >(GetMultiPositionsQuery, {
    variables: { ids: positionIds },
    fetchPolicy: 'no-cache',
    skip: !positionIds.length,
  })

  useEffect(() => {
    const { positions: positionsFromTheGraph } = fetchedPositions ?? { positions: [] }
    if (!loadingQuery && positionsFromTheGraph.length) {
      setPositions(positionsFromTheGraph)
    }

    // Validate all positions exist
    if (
      !positionsFromTheGraph.length ||
      (!loadingQuery && positionsFromTheGraph.length < positionIds.length)
    ) {
      errors.push(PositionErrors.NOT_FOUND_ERROR)
    }
  }, [fetchedPositions, positionIds, loadingQuery, errors])

  const { balances, loading: loadingBalances } = useBalanceForMultiPosition(positionIds)
  if (checkForEmptyBalance && positionIds.length && balances.length) {
    if (balances.includes(BIG_ZERO)) {
      errors.push(PositionErrors.EMPTY_BALANCE_ERROR)
    }
  }

  // Validate string position
  const hasError: boolean =
    !!positionIds.length && positionIds.map((id) => isPositionIdValid(id)).includes(false)
  if (hasError) {
    errors.push(PositionErrors.INVALID_ERROR)
  }

  // Validate error position from theGraph
  if (errorFetchingPositions) {
    errors.push(PositionErrors.FETCHING_ERROR)
  }

  const value = {
    positions,
    positionIds,
    errors,
    loading: loadingBalances || loadingQuery || balances.length !== positions.length,
    balances,
    addPositionId,
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
