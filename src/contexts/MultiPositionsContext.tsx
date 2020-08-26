import { isPositionIdValid } from 'util/tools'
import { BalanceErrors, Errors, PositionErrors } from 'util/types'

import { useQuery } from '@apollo/react-hooks'
import { BatchBalanceProvider, useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { BigNumber } from 'ethers/utils'
import { useBalanceForBatchPosition } from 'hooks/useBalanceForBatchPosition'
import { useErrors } from 'hooks/useErrors'
import { GetMultiPositionsQuery } from 'queries/positions'
import React, { useCallback, useEffect, useState } from 'react'

import { GetMultiPositions, GetMultiPositions_positions } from '../types/generatedGQL'

const BIG_ZERO = new BigNumber(0)

export interface MultiPositionsContext {
  positions: Array<GetMultiPositions_positions>
  positionIds: Array<string>
  loading: boolean
  errors: Errors[]
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
  const {
    balances,
    errors: balanceErrors,
    loading: loadingBalances,
    positionIds: balancePositionIds,
    updateBalaces,
  } = useBatchBalanceContext()

  // const errors: any[] = []
  const { clearErrors, errors, pushError, removeError } = useErrors()

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
  }, [fetchedPositions, positionIds, loadingQuery, errors, removeError, pushError])

  useEffect(() => {
    updateBalaces(positionIds)
  }, [positionIds, updateBalaces])

  useEffect(() => {
    if (checkForEmptyBalance && positionIds.length && balances.length) {
      removeError(PositionErrors.EMPTY_BALANCE_ERROR)
      if (balances.includes(BIG_ZERO)) {
        pushError(PositionErrors.EMPTY_BALANCE_ERROR)
      }
    }
  }, [balances, positionIds, checkForEmptyBalance, removeError, pushError])

  useEffect(() => {
    removeError(PositionErrors.FETCHING_ERROR)
    if (errorFetchingPositions) {
      pushError(PositionErrors.FETCHING_ERROR)
    }
  }, [errorFetchingPositions, pushError, removeError])

  useEffect(() => {
    removeError(BalanceErrors.INVALID_ERROR)
    removeError(BalanceErrors.FETCHING_ERROR)
    if (errorFetchingPositions) {
      pushError(PositionErrors.FETCHING_ERROR)
    }
  }, [balanceErrors, errorFetchingPositions, pushError, removeError])

  // Validate string position
  // const hasError: boolean =
  //   !!positionIds.length && positionIds.map((id) => isPositionIdValid(id)).includes(false)
  // if (hasError) {
  //   pushError(PositionErrors.INVALID_ERROR)
  // }

  // Validate error position from theGraph
  // if (errorFetchingPositions) {
  //   pushError(PositionErrors.FETCHING_ERROR)
  // }

  const value = {
    positions,
    positionIds,
    errors,
    loading: loadingBalances || loadingQuery || balances.length !== positions.length,
    balances,
    addPositionId,
    removePositionId,
    clearPositions,
    setPositions,
  }

  return (
    <BatchBalanceProvider>
      <MultiPositionsContext.Provider value={value}>
        {props.children}
      </MultiPositionsContext.Provider>
    </BatchBalanceProvider>
  )
}

export const useMultiPositionsContext = (): MultiPositionsContext => {
  return React.useContext(MultiPositionsContext)
}
