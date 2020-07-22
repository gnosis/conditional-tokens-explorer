import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import { SplitPositionForm, bytesRegex } from './SplitCondition'
import { useWeb3Connected } from 'contexts/Web3Context'

interface Props {
  formMethods: FormContextValues<SplitPositionForm>
  onOutcomeSlotChange: (n: number) => void
}

export const InputCondition = ({
  onOutcomeSlotChange,
  formMethods: { watch, register, errors },
}: Props) => {
  const conditionIdErrors = errors.conditionId
  const watchConditionId = watch('conditionId')

  const { CTService } = useWeb3Connected()

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      const outcomeSlot = await CTService.getOutcomeSlotCount(conditionId)
      onOutcomeSlotChange(outcomeSlot.toNumber())
    }
    if (watchConditionId && !conditionIdErrors) {
      getOutcomeSlot(watchConditionId)
    }
  }, [CTService, watchConditionId, conditionIdErrors, onOutcomeSlotChange])

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
            const conditionExist = await CTService.conditionExists(value)
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
