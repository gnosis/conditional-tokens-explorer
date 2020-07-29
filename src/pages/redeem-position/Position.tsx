import React, { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GetPosition as getPosition } from '../../types/generatedGQL'
import { GetPositionQuery } from '../../queries/positions'
import { BYTES_REGEX } from '../../config/constants'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { displayPositions } from '../../util/tools'

interface Props {
  position: string
}

// Error strings
const invalidPositionError = `Invalid position`
const fetchingPositionError = `Error fetching position`
const positionDoesntExistError = `Position doesn't exist`
const balanceIsZeroError = `Balance for this position is zero`

export const Position = (props: Props) => {
  const { position } = props

  const { networkConfig } = useWeb3Connected()

  const [errors, setErrors] = useState<string[]>([])
  const [positionToDisplay, setPositionToDisplay] = useState<string>('')

  const addError = useCallback(
    (error: string) => {
      const newErrors = [...errors]
      const index = newErrors.indexOf(error)
      if (index === -1) {
        newErrors.push(error)
        setErrors(newErrors)
      }
    },
    [errors]
  )

  const removeError = useCallback(
    (error: string) => {
      const newErrors = [...errors]
      const index = newErrors.indexOf(error)
      if (index !== -1) {
        newErrors.splice(index, 1)
        setErrors(newErrors)
      }
    },
    [errors]
  )

  const { data: fetchedPosition, loading, error: errorFetchingPosition } = useQuery<getPosition>(
    GetPositionQuery,
    {
      variables: { id: position },
      fetchPolicy: 'no-cache',
      skip: !position,
    }
  )

  // Validate string position
  useEffect(() => {
    const hasError: boolean = position !== '' && !BYTES_REGEX.test(position)
    if (hasError) {
      addError(invalidPositionError)
    } else {
      removeError(invalidPositionError)
    }
  }, [position, addError, removeError])

  // Validate error position from theGraph
  useEffect(() => {
    if (errorFetchingPosition) {
      addError(fetchingPositionError)
    } else {
      removeError(fetchingPositionError)
    }
  }, [errorFetchingPosition, addError, removeError])

  // Validate position exist
  useEffect(() => {
    if (position) {
      const { position: positionFromTheGraph } = fetchedPosition ?? { position: null }
      if (!positionFromTheGraph) {
        addError(positionDoesntExistError)
      } else {
        removeError(positionDoesntExistError)
      }
    }
  }, [position, fetchedPosition, loading, addError, removeError])

  // Validate if the user has position balance
  const { balance } = useBalanceForPosition(position)
  useEffect(() => {
    if (position && balance.isZero()) {
      addError(balanceIsZeroError)
    } else {
      removeError(balanceIsZeroError)
    }
  }, [balance, position, addError, removeError])

  // Generate position to display, see method `displayPosition`
  useEffect(() => {
    if (position) {
      const { position: positionFromTheGraph } = fetchedPosition ?? { position: null }
      if (positionFromTheGraph) {
        setPositionToDisplay(displayPositions(positionFromTheGraph, networkConfig.networkId))
      }
    }
  }, [position, fetchedPosition, loading, networkConfig.networkId])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <p>{positionToDisplay}</p>
      {errors.map((error: string, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </>
  )
}
