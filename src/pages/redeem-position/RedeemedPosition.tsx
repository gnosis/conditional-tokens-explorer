import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'

import { GetConditionQuery } from '../../queries/conditions'
import { GetCondition, GetCondition_condition_positions } from '../../types/generatedGQL'

interface Props {
  position: string
  condition: string
}

// Error strings
const positionBelongToConditionError = `The position doesn't belong to the condition`
const positionNotResolvedError = `Position not resolved`

export const RedeemedPosition = (props: Props) => {
  const { condition, position } = props

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

  const { data: fetchedCondition, loading } = useQuery<GetCondition>(GetConditionQuery, {
    variables: { id: condition },
    fetchPolicy: 'no-cache',
    skip: !condition || !position,
  })

  // Validate position belongs to the condition
  useEffect(() => {
    if (condition && position) {
      const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }
      if (conditionFromTheGraph) {
        const { payouts, positions } = conditionFromTheGraph
        const positionFound =
          positions &&
          positions.filter(
            (positionObject: GetCondition_condition_positions) =>
              positionObject.id.toLowerCase() === position.toLowerCase()
          )
        if (!positionFound || (positionFound && positionFound.length === 0)) {
          addError(positionBelongToConditionError)
        } else {
          removeError(positionBelongToConditionError)
        }

        if (!payouts) {
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
