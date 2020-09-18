import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'

import { SelectCondition } from 'components/form/SelectCondition'
import { useConditionContext } from 'contexts/ConditionContext'
import { SplitPositionFormMethods } from 'pages/SplitPosition/Form'
import { GetCondition_condition } from 'types/generatedGQL'

interface Props {
  formMethods: FormContextValues<SplitPositionFormMethods>
  onConditionChange: (condition: Maybe<GetCondition_condition>) => void
}

export const InputCondition: React.FC<Props> = (props) => {
  const {
    formMethods: { register, setValue },
    onConditionChange,
  } = props
  const { condition, errors: conditionContextErrors, loading } = useConditionContext()

  useEffect(() => {
    register('conditionId', { required: true })
  }, [register])

  useEffect(() => {
    if (loading || conditionContextErrors.length || !condition) {
      setValue('conditionId', '', true)
      onConditionChange(null)
    }

    if (!loading && !conditionContextErrors.length && condition) {
      setValue('conditionId', condition.id, true)
      onConditionChange(condition)
    }
  }, [condition, conditionContextErrors, loading, onConditionChange, setValue])

  return <SelectCondition />
}
