import { SelectCondition } from 'components/form/SelectCondition'
import { useConditionContext } from 'contexts/ConditionContext'
import { SplitPositionFormMethods } from 'pages/SplitPosition/Form'
import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'

interface Props {
  formMethods: FormContextValues<SplitPositionFormMethods>
  onOutcomeSlotChange: (n: number) => void
}

export const InputCondition = ({
  formMethods: { register, setValue },
  onOutcomeSlotChange,
}: Props) => {
  const { condition, errors: conditionContextErrors, loading } = useConditionContext()

  useEffect(() => {
    register('conditionId', { required: true })
  }, [register])

  useEffect(() => {
    if (loading || conditionContextErrors.length || !condition) {
      setValue('conditionId', '', true)
    }

    if (!loading && !conditionContextErrors.length && condition) {
      setValue('conditionId', condition.id, true)
      onOutcomeSlotChange(condition.outcomeSlotCount)
    }
  }, [condition, conditionContextErrors, loading, onOutcomeSlotChange, setValue])

  return <SelectCondition />
}
