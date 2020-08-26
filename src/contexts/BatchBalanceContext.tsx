import { isPositionIdValid } from 'util/tools'
import { BalanceErrors } from 'util/types'

import { BigNumber } from 'ethers/utils'
import { useBalanceForBatchPosition } from 'hooks/useBalanceForBatchPosition'
import { useErrors } from 'hooks/useErrors'
import React, { useCallback, useEffect, useState } from 'react'

export interface BatchBalanceContext {
  positionIds: string[]
  loading: boolean
  errors: BalanceErrors[]
  balances: BigNumber[]
  updateBalaces: (positionIds: Array<string>) => void
}

export const BATCH_BALANCE_CONTEXT_DEFAULT_VALUE = {
  positionIds: [],
  loading: false,
  errors: [],
  balances: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateBalaces: () => {},
}

const BatchBalanceContext = React.createContext<BatchBalanceContext>(
  BATCH_BALANCE_CONTEXT_DEFAULT_VALUE
)

interface Props {
  children: React.ReactNode
}

export const BatchBalanceProvider = (props: Props) => {
  const { children } = props
  const [positionIds, setPositionIds] = useState<Array<string>>([])
  const { clearErrors, errors, pushError, removeError } = useErrors()
  const { balances, loading } = useBalanceForBatchPosition(positionIds)

  const updateBalaces = useCallback(
    (positionIds: Array<string>) => {
      clearErrors()
      const validPositions: boolean =
        positionIds.length > 0 &&
        positionIds.map((id) => isPositionIdValid(id)).every((valid) => valid)
      if (!validPositions) {
        pushError(BalanceErrors.INVALID_ERROR)
        return
      }

      setPositionIds(positionIds)
    },
    [clearErrors, pushError, setPositionIds]
  )

  const value = {
    positionIds,
    loading,
    balances,
    errors: errors as BalanceErrors[],
    updateBalaces,
  }
  return <BatchBalanceContext.Provider value={value}>{children}</BatchBalanceContext.Provider>
}

export const useBatchBalanceContext = (): BatchBalanceContext => {
  return React.useContext(BatchBalanceContext)
}
