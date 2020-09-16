import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import React, { useContext, useState } from 'react'

import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { GetPositionQuery } from 'queries/positions'
import { GetPosition, GetPosition_position } from 'types/generatedGQL'
import { isPositionIdValid } from 'util/tools'
import { PositionErrors } from 'util/types'

export interface PositionContext {
  position: Maybe<GetPosition_position>
  positionId: string
  loading: boolean
  balance: Maybe<BigNumber>
  errors: PositionErrors[]
  setPositionId: (positionId: string) => void
  clearPosition: () => void
}

export const POSITION_CONTEXT_DEFAULT_VALUE = {
  position: null,
  positionId: '',
  loading: false,
  balance: null,
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPositionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearPosition: () => {},
}

const PositionContext = React.createContext<PositionContext>(POSITION_CONTEXT_DEFAULT_VALUE)

interface Props {
  checkForEmptyBalance?: boolean
  children: React.ReactNode
}

export const PositionProvider = (props: Props) => {
  const { checkForEmptyBalance } = props
  const [positionId, setPositionId] = useState('')
  const { getValue } = useLocalStorage('positionid')

  const errors = []
  let position: Maybe<GetPosition_position> = null

  const setPositionIdCallback = React.useCallback((positionId: string): void => {
    setPositionId(positionId)
  }, [])

  const clearPosition = React.useCallback((): void => {
    setPositionId('')
  }, [])

  const { data: fetchedPosition, error: errorFetchingPosition, loading } = useQuery<GetPosition>(
    GetPositionQuery,
    {
      variables: { id: positionId },
      fetchPolicy: 'no-cache',
      skip: !positionId,
    }
  )

  if (positionId) {
    const { position: positionFromTheGraph } = fetchedPosition ?? { position: null }
    if (positionFromTheGraph) {
      position = positionFromTheGraph
    }

    // Validate position exist
    if (!positionFromTheGraph) {
      errors.push(PositionErrors.NOT_FOUND_ERROR)
    }
  }

  const { balance } = useBalanceForPosition(positionId)
  if (position && balance && balance.isZero() && checkForEmptyBalance) {
    errors.push(PositionErrors.EMPTY_BALANCE_ERROR)
  }

  // Validate string position
  const hasError: boolean = positionId !== '' && !isPositionIdValid(positionId)
  if (hasError) {
    errors.push(PositionErrors.INVALID_ERROR)
  }

  // Validate error position from theGraph
  if (errorFetchingPosition) {
    errors.push(PositionErrors.FETCHING_ERROR)
  }

  React.useEffect(() => {
    const localStoragePosition = getValue()
    if (localStoragePosition) {
      setPositionIdCallback(localStoragePosition)
    }
  }, [getValue, setPositionIdCallback])

  const value = {
    position,
    positionId,
    balance,
    errors,
    loading,
    setPositionId: setPositionIdCallback,
    clearPosition,
  }

  return <PositionContext.Provider value={value}>{props.children}</PositionContext.Provider>
}

export const usePositionContext = (): PositionContext => {
  return useContext(PositionContext)
}
