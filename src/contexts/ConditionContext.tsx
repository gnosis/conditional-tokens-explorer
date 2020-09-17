import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { GetConditionQuery } from 'queries/conditions'
import { GetCondition, GetCondition_condition } from 'types/generatedGQL'
import { isConditionIdValid } from 'util/tools'
import { ConditionErrors } from 'util/types'

export interface ConditionContext {
  clearCondition: () => void
  condition: Maybe<GetCondition_condition>
  conditionId: string
  errors: ConditionErrors[]
  loading: boolean
  setCondition: (condition: GetCondition_condition) => void
  setConditionId: (conditionId: string) => void
}

export const CONDITION_CONTEXT_DEFAULT_VALUE = {
  condition: null,
  conditionId: '',
  loading: false,
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setConditionId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCondition: () => {},
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
  const [condition, setCondition] = React.useState<Maybe<GetCondition_condition>>(null)
  const [errors, setErrors] = React.useState<ConditionErrors[]>([])
  const [validId, setValidId] = React.useState(false)
  const { getValue } = useLocalStorage('conditionid')

  const clearErrors = React.useCallback((): void => {
    setErrors([])
  }, [])

  const removeError = React.useCallback((error): void => {
    setErrors((errors) => (errors ? errors.filter((e) => e !== error) : []))
  }, [])

  const pushError = React.useCallback((newError): void => {
    setErrors((errors) => Array.from(new Set(errors).add(newError)))
  }, [])

  const clearCondition = React.useCallback((): void => {
    setConditionId('')
    setCondition(null)
    clearErrors()
  }, [clearErrors])

  const setConditionIdCallback = React.useCallback(
    (conditionId: string): void => {
      clearCondition()

      if (isConditionIdValid(conditionId)) {
        setValidId(true)
        setConditionId(conditionId)
      } else if (conditionId !== '') {
        pushError(ConditionErrors.INVALID_ERROR)
      }
    },
    [clearCondition, pushError]
  )

  const setConditionCallback = React.useCallback(
    (condition: GetCondition_condition): void => {
      clearCondition()
      setCondition(condition)
    },
    [clearCondition]
  )

  const { data: fetchedCondition, error: errorFetchingCondition, loading } = useQuery<GetCondition>(
    GetConditionQuery,
    {
      variables: { id: conditionId },
      fetchPolicy: 'no-cache',
      skip: !conditionId || !validId,
    }
  )

  React.useEffect(() => {
    const { condition: conditionFromTheGraph } = fetchedCondition ?? { condition: null }

    if (conditionId && validId && !loading && !conditionFromTheGraph) {
      pushError(ConditionErrors.NOT_FOUND_ERROR)
    }

    if (conditionFromTheGraph) {
      setCondition(conditionFromTheGraph)
      removeError(ConditionErrors.NOT_FOUND_ERROR)
    }
  }, [fetchedCondition, validId, loading, conditionId, pushError, removeError])

  React.useEffect(() => {
    removeError(ConditionErrors.NOT_RESOLVED_ERROR)
    if (condition && checkForConditionNotResolved && !condition.resolved) {
      pushError(ConditionErrors.NOT_RESOLVED_ERROR)
    }
  }, [condition, checkForConditionNotResolved, removeError, pushError])

  React.useEffect(() => {
    if (errorFetchingCondition) {
      pushError(ConditionErrors.FETCHING_ERROR)
    } else {
      removeError(ConditionErrors.FETCHING_ERROR)
    }
  }, [errorFetchingCondition, pushError, removeError])

  React.useEffect(() => {
    const localStorageCondition = getValue()
    if (localStorageCondition) {
      setConditionIdCallback(localStorageCondition)
    }
  }, [getValue, setConditionIdCallback])

  const value = {
    condition,
    conditionId,
    errors,
    loading,
    setConditionId: setConditionIdCallback,
    setCondition: setConditionCallback,
    clearCondition,
  }

  return <ConditionContext.Provider value={value}>{props.children}</ConditionContext.Provider>
}

export const useConditionContext = (): ConditionContext => {
  return React.useContext(ConditionContext)
}
