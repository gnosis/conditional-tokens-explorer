import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import { GetCondition, GetCondition_condition } from '../types/generatedGQL'
import { GetConditionQuery } from '../queries/conditions'
import { ConditionErrors } from '../util/types'
import { isConditionIdValid } from '../util/tools'

export interface ConditionContext {
  condition: Maybe<GetCondition_condition>
  conditionId: string
  loading: boolean
  errors: ConditionErrors[]
  setConditionId: (conditionId: string) => void
}

export const CONDITION_CONTEXT_DEFAULT_VALUE = {
  condition: null,
  conditionId: '',
  loading: false,
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setConditionId: (conditionId: string) => {},
}

const ConditionContext = React.createContext<ConditionContext>(CONDITION_CONTEXT_DEFAULT_VALUE)

interface Props {
  children: React.ReactNode
}

export const ConditionProvider = (props: Props) => {
  const [conditionId, setConditionId] = React.useState('')
  const errors = []
  let condition: Maybe<GetCondition_condition> = null

  const setConditionIdCallback = React.useCallback((conditionId: string): void => {
    setConditionId(conditionId)
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
  }

  return <ConditionContext.Provider value={value}>{props.children}</ConditionContext.Provider>
}

export const useConditionContext = (): ConditionContext => {
  return React.useContext(ConditionContext)
}
