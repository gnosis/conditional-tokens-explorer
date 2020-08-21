import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'

import { BYTES_REGEX } from '../../../config/constants'
import { Web3ContextStatus, useWeb3Context } from '../../../contexts/Web3Context'
import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Error, ErrorContainer } from '../../pureStyledComponents/Error'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { TitleControl } from '../../pureStyledComponents/TitleControl'
import { TitleValue } from '../../text/TitleValue'

interface Props {
  formMethods: FormContextValues<SplitPositionFormMethods>
  onOutcomeSlotChange: (n: number) => void
}

export const InputCondition = ({
  formMethods: { errors, register, watch },
  onOutcomeSlotChange,
}: Props) => {
  const conditionIdErrors = errors.conditionId
  const watchConditionId = watch('conditionId')

  const { status } = useWeb3Context()

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      if (
        status._type === Web3ContextStatus.Infura ||
        status._type === Web3ContextStatus.Connected
      ) {
        const { CTService } = status

        const outcomeSlot = await CTService.getOutcomeSlotCount(conditionId)
        onOutcomeSlotChange(outcomeSlot.toNumber())
      }
    }
    if (watchConditionId && !conditionIdErrors) {
      getOutcomeSlot(watchConditionId)
    }
  }, [status, watchConditionId, conditionIdErrors, onOutcomeSlotChange])

  const validate = async (value: any) => {
    if (status._type === Web3ContextStatus.Infura || status._type === Web3ContextStatus.Connected) {
      const { CTService } = status
      const conditionExist = await CTService.conditionExists(value)
      return conditionExist
    } else {
      return false
    }
  }

  return (
    <TitleValue
      title="Condition Id"
      titleControl={<TitleControl>Select Condition</TitleControl>}
      value={
        <>
          <Textfield
            name="conditionId"
            placeholder="Please select a condition..."
            ref={register({
              required: true,
              pattern: BYTES_REGEX,
              validate: validate,
            })}
            type="text"
          />
          {conditionIdErrors && (
            <ErrorContainer>
              {conditionIdErrors.type === 'pattern' && <Error>{'Invalid bytes32 string'}</Error>}
              {conditionIdErrors.type === 'validate' && <Error>{'Invalid condition'}</Error>}
            </ErrorContainer>
          )}
        </>
      }
    />
  )
}
