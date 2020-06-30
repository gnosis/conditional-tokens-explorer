import React, { useEffect } from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { FormContextValues } from 'react-hook-form'
import { SplitPositionForm, bytesRegex } from './SplitCondition'

interface Props {
  ctService: ConditionalTokensService
  formMethods: FormContextValues<SplitPositionForm>
  onOutcomeSlotChange: (n: number) => void
}

export const InputCondition = ({
  ctService,
  onOutcomeSlotChange,
  formMethods: { watch, register, errors },
}: Props) => {
  const conditionIdErrors = errors.conditionId
  const watchConditionId = watch('conditionId')

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      const outcomeSlot = await ctService.getOutcomeSlotCount(conditionId)
      onOutcomeSlotChange(outcomeSlot.toNumber())
    }
    if (watchConditionId && !conditionIdErrors) {
      getOutcomeSlot(watchConditionId)
    }
  }, [ctService, watchConditionId, conditionIdErrors, onOutcomeSlotChange])

  return (
    <div>
      <label htmlFor="conditionId">Condition Id</label>
      <input
        name="conditionId"
        type="text"
        ref={register({
          required: true,
          pattern: bytesRegex,
          validate: async (value) => {
            const conditionExist = await ctService.conditionExists(value)
            return conditionExist
          },
        })}
      ></input>
      {conditionIdErrors && (
        <div>
          <p>{conditionIdErrors.type === 'pattern' && 'Invalid bytes32 string'}</p>
          <p>{conditionIdErrors.type === 'validate' && 'Invalid condition'}</p>
        </div>
      )}
    </div>
  )
}
