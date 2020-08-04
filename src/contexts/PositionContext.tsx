import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { GetPosition, GetPosition_position } from '../types/generatedGQL'
import { isPositionIdValid } from '../util/tools'
import { PositionErrors } from '../util/types'
import { GetPositionQuery } from '../queries/positions'

export interface PositionContext {
  position: Maybe<GetPosition_position>
  positionId: string
  loading: boolean
  errors: PositionErrors[]
  setPositionId: (positionId: string) => void
  clearPosition: () => void
}

export const POSITION_CONTEXT_DEFAULT_VALUE = {
  position: null,
  positionId: '',
  loading: false,
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPositionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearPosition: () => {},
}

const PositionContext = React.createContext<PositionContext>(POSITION_CONTEXT_DEFAULT_VALUE)

interface Props {
  children: React.ReactNode
}

export const PositionProvider = (props: Props) => {
  const [positionId, setPositionId] = React.useState('')
  const errors = []
  let position: Maybe<GetPosition_position> = null

  const setPositionIdCallback = React.useCallback((positionId: string): void => {
    setPositionId(positionId)
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
    errors,
    loading,
    setPositionId: setPositionIdCallback,
    clearPosition: () => setPositionIdCallback(''),
  }

  return <PositionContext.Provider value={value}>{props.children}</PositionContext.Provider>
}

export const usePositionContext = (): PositionContext => {
  return React.useContext(PositionContext)
}
