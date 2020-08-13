import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { GetConditionQuery } from '../queries/conditions'
import { GetCondition, GetCondition_condition } from '../types/generatedGQL'
import { isConditionIdValid } from '../util/tools'
import { ConditionErrors } from '../util/types'

export interface ConditionContext {
  condition: Maybe<GetCondition_condition>
  conditionId: string
  loading: boolean
  errors: ConditionErrors[]
  setConditionId: (conditionId: string) => void
  clearCondition: () => void
}

export const CONDITION_CONTEXT_DEFAULT_VALUE = {
  condition: null,
  conditionId: '',
  loading: false,
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setConditionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearCondition: () => {},
}

const ConditionContext = React.createContext<ConditionContext>(CONDITION_CONTEXT_DEFAULT_VALUE)

interface Props {
  checkForConditionNotResolved?: boolean
  children: React.ReactNode
}

export const ConditionProvider = (props: Props) => {
  const { checkForConditionNotResolved } = props

  const [conditionId, setConditionId] = React.useState('')
  const errors = []
  let condition: Maybe<GetCondition_condition> = null

  const setConditionIdCallback = React.useCallback((conditionId: string): void => {
    setConditionId(conditionId)
  }, [])

  const clearCondition = React.useCallback((): void => {
    setConditionId('')
  }, [])

  const { data: fetchedCondition, error: errorFetchingCondition, loading } = useQuery<GetCondition>(
    GetConditionQuery,
    {
      variables: { id: conditionId },
      fetchPolicy: 'no-cache',
      skip: !conditionId,
    }
  )

  if (conditionId) {
    const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }
    if (conditionFromTheGraph) {
      condition = conditionFromTheGraph
    }

    // Validate condition exist and if is resolved
    if (!conditionFromTheGraph) {
      errors.push(ConditionErrors.NOT_FOUND_ERROR)
    }

    if (conditionFromTheGraph && !conditionFromTheGraph.resolved && checkForConditionNotResolved) {
      if (!errors.includes(ConditionErrors.NOT_RESOLVED_ERROR))
        errors.push(ConditionErrors.NOT_RESOLVED_ERROR)
    }
  }

  // Validate string condition
  const hasError: boolean = conditionId !== '' && !isConditionIdValid(conditionId)
  if (hasError) {
    errors.push(ConditionErrors.INVALID_ERROR)
  }

  // Validate error condition from theGraph
  if (errorFetchingCondition) {
    errors.push(ConditionErrors.FETCHING_ERROR)
  }

  const value = {
    condition,
    conditionId,
    errors,
    loading,
    setConditionId: setConditionIdCallback,
    clearCondition,
  }

  return <ConditionContext.Provider value={value}>{props.children}</ConditionContext.Provider>
}

export const useConditionContext = (): ConditionContext => {
  return React.useContext(ConditionContext)
}
