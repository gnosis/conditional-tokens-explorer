import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'

import { BYTES_REGEX } from '../../../config/constants'
import { useWeb3ConnectedOrInfura } from '../../../contexts/Web3Context'
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

  const { CTService } = useWeb3ConnectedOrInfura()

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      const outcomeSlot = await CTService.getOutcomeSlotCount(conditionId)
      onOutcomeSlotChange(outcomeSlot.toNumber())
    }
    if (watchConditionId && !conditionIdErrors) {
      getOutcomeSlot(watchConditionId)
    }
  }, [CTService, watchConditionId, conditionIdErrors, onOutcomeSlotChange])

  const validate = async (value: any) => {
    const conditionExist = await CTService.conditionExists(value)
    return conditionExist
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
