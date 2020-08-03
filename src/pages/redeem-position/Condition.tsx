import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'

import { BYTES_REGEX } from '../../config/constants'
import { GetConditionQuery } from '../../queries/conditions'
import { GetCondition } from '../../types/generatedGQL'
import { displayConditions } from '../../util/tools'

interface Props {
  condition: string
}

// Error strings
const invalidConditionError = `Invalid condition`
const fetchingConditionError = `Error fetching condition`
const conditionDoesntExistError = `Condition doesn't exist`
const conditionIsNotResolvedError = `Condition is not resolved`

export const Condition = (props: Props) => {
  const { condition } = props

  const [errors, setErrors] = useState<string[]>([])
  const [conditionToDisplay, setConditionToDisplay] = useState<string>('')

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

  const { data: fetchedCondition, error: errorFetchingCondition, loading } = useQuery<GetCondition>(
    GetConditionQuery,
    {
      variables: { id: condition },
      fetchPolicy: 'no-cache',
      skip: !condition,
    }
  )

  // Validate string condition
  useEffect(() => {
    const hasError: boolean = condition !== '' && !BYTES_REGEX.test(condition)
    if (hasError) {
      addError(invalidConditionError)
    } else {
      removeError(invalidConditionError)
    }
  }, [condition, addError, removeError])

  // Validate error condition from theGraph
  useEffect(() => {
    if (errorFetchingCondition) {
      addError(fetchingConditionError)
    } else {
      removeError(fetchingConditionError)
    }
  }, [errorFetchingCondition, addError, removeError])

  // Validate condition exist
  useEffect(() => {
    if (condition) {
      const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }
      if (!conditionFromTheGraph) {
        addError(conditionDoesntExistError)
      } else {
        removeError(conditionDoesntExistError)
      }
    }
  }, [condition, fetchedCondition, loading, addError, removeError])

  // Validate if the condition is resolved
  useEffect(() => {
    const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }
    if (conditionFromTheGraph && conditionFromTheGraph.resolved) {
      addError(conditionIsNotResolvedError)
    } else {
      removeError(conditionIsNotResolvedError)
    }
  }, [fetchedCondition, addError, removeError])

  // Generate position to display, see method `displayPosition`
  useEffect(() => {
    if (condition) {
      const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }
      if (conditionFromTheGraph) {
        setConditionToDisplay(displayConditions([conditionFromTheGraph]))
      }
    }
  }, [condition, fetchedCondition, loading])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <p>{conditionToDisplay}</p>
      {errors.map((error: string, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </>
  )
}
