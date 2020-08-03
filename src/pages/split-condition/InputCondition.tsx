import { useWeb3Connected } from 'contexts/Web3Context'
import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'

import { BYTES_REGEX } from '../../config/constants'

import { SplitPositionForm } from './SplitCondition'

interface Props {
  formMethods: FormContextValues<SplitPositionForm>
  onOutcomeSlotChange: (n: number) => void
}

export const InputCondition = ({
  formMethods: { errors, register, watch },
  onOutcomeSlotChange,
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
        ref={register({
          required: true,
          pattern: BYTES_REGEX,
          validate: async (value) => {
            const conditionExist = await CTService.conditionExists(value)
            return conditionExist
          },
        })}
        type="text"
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
