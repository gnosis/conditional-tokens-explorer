import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import React, { useContext, useState } from 'react'

import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { GetPositionQuery } from 'queries/CTEPositions'
import { GetPosition, GetPosition_position } from 'types/generatedGQLForCTE'
import { isPositionIdValid } from 'util/tools'
import { PositionErrors } from 'util/types'

export interface PositionContext {
  position: Maybe<GetPosition_position>
  positionId: string
  loading: boolean
  balanceERC1155: BigNumber
  balanceERC20: BigNumber
  collateralTokenAddress: string
  wrappedTokenAddress: string
  errors: PositionErrors[]
  refetchBalances: () => void
  refetchPosition: () => void
  setPositionId: (positionId: string) => void
  clearPosition: () => void
}

export const POSITION_CONTEXT_DEFAULT_VALUE = {
  position: null,
  positionId: '',
  loading: false,
  balanceERC1155: new BigNumber(0),
  balanceERC20: new BigNumber(0),
  collateralTokenAddress: '',
  wrappedTokenAddress: '',
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refetchBalances: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refetchPosition: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPositionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearPosition: () => {},
}

const PositionContext = React.createContext<PositionContext>(POSITION_CONTEXT_DEFAULT_VALUE)

interface Props {
  checkForEmptyBalanceERC1155?: boolean
  checkForEmptyBalanceERC20?: boolean
  children: React.ReactNode
}

export const PositionProvider = (props: Props) => {
  const { checkForEmptyBalanceERC20, checkForEmptyBalanceERC1155 } = props
  const [positionId, setPositionId] = useState('')

  const errors = []
  let position: Maybe<GetPosition_position> = null

  const setPositionIdCallback = React.useCallback((positionId: string): void => {
    setPositionId(positionId)
  }, [])

  const clearPosition = React.useCallback((): void => {
    setPositionId('')
  }, [])

  const {
    data: fetchedPosition,
    error: errorFetchingPosition,
    loading,
    refetch: refetchPosition,
  } = useQuery<GetPosition>(GetPositionQuery, {
    variables: { id: positionId },
    fetchPolicy: 'no-cache',
    skip: !positionId,
  })

  if (positionId && fetchedPosition) {
    position = fetchedPosition?.position
  }

  if (positionId && !position && !loading) {
    errors.push(PositionErrors.NOT_FOUND_ERROR)
  }

  const { balanceERC20, balanceERC1155, refetch: refetchBalances } = useBalanceForPosition(
    positionId
  )

  if (position && balanceERC1155 && balanceERC1155.isZero() && checkForEmptyBalanceERC1155) {
    errors.push(PositionErrors.EMPTY_BALANCE_ERC1155_ERROR)
  }

  if (position && balanceERC20 && balanceERC20.isZero() && checkForEmptyBalanceERC20) {
    errors.push(PositionErrors.EMPTY_BALANCE_ERC20_ERROR)
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

  const value = {
    position,
    positionId,
    balanceERC1155,
    balanceERC20,
    collateralTokenAddress: position?.collateralToken?.id ?? '',
    wrappedTokenAddress: position?.wrappedToken?.id ?? '',
    refetchBalances,
    refetchPosition,
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
