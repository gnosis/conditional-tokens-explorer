import React, { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GetCondition as getCondition, GetPosition as getPosition } from '../../types/generatedGQL'
import { GetPositionQuery } from '../../queries/positions'
import { BYTES_REGEX } from '../../config/constants'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { displayPositions } from '../../util/tools'
import { GetConditionQuery } from '../../queries/conditions'

interface Props {
  position: string
  condition: string
}

// Error strings
const positionBelongToConditionError = `The position doesn't belong to the condition`
const positionNotResolvedError = `Position not resolved`

export const RedeemedPosition = (props: Props) => {
  const { position, condition } = props

  const [errors, setErrors] = useState<string[]>([])
  const [redeemedPositionToDisplay, setRedeemedPositionToDisplay] = useState<string>('')

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

  const { data: fetchedCondition, loading } = useQuery<getCondition>(
    GetConditionQuery,
    {
      variables: { id: condition },
      fetchPolicy: 'no-cache',
      skip: !condition || !position,
    }
  )

  // Validate position belongs to the condition
  useEffect(() => {
    if (condition && position) {
      const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }
      if (conditionFromTheGraph) {
        const { positions, payouts } = conditionFromTheGraph
        const positionFound = positions && positions.filter((positionObject: any) => positionObject.id.toLowerCase() === position.toLowerCase())
        if(!positionFound || (positionFound && positionFound.length === 0)) {
          addError(positionBelongToConditionError)
        } else {
          removeError(positionBelongToConditionError)
        }

        if(!payouts) {
          addError(positionNotResolvedError)
        } else {
          removeError(positionNotResolvedError)
        }
      } else {
        removeError(positionBelongToConditionError)
      }
    }
  }, [condition, position, fetchedCondition, loading, addError, removeError])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <p>{redeemedPositionToDisplay}</p>
      {errors.map((error: string, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </>
  )
}
