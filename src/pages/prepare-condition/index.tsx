import React, { useState } from 'react'
import { InputOutcomes } from '../../components/common/InputOutcomes'
import { InputAddress } from '../../components/common/InputAddress'
import { InputBytes } from '../../components/common/InputBytes'
import { PreviewCondition } from './PreviewCondition'
import { useWeb3Connected } from '../../hooks/useWeb3Context'
import { useForm } from 'react-hook-form'

export const PrepareConditionContainer = () => {
  const [numOutcomes, setNumOutcomes] = useState(0)
  const [oracleAddress, setOracleAddress] = useState('')
  const [questionId, setQuestionId] = useState('')

  const { CTService, address } = useWeb3Connected()
  const {
    register,
    errors,
    setValue,
    formState: { isValid },
  } = useForm<{ outcomesSlotCount: number; oracle: string; questionId: string }>({
    mode: 'onChange',
  })

  return (
    <>
      <p>{numOutcomes}</p>
      <h3>Outcomes number</h3>
      <InputOutcomes
        name="outcomesSlotCount"
        callback={setNumOutcomes}
        register={register}
        errors={errors.outcomesSlotCount}
      />

      <p>{oracleAddress}</p>
      <h3>Oracle Address</h3>
      <InputAddress
        name="oracle"
        register={register}
        errors={errors.oracle}
        callback={setOracleAddress}
      />
      <button onClick={() => setValue('oracle', address, true)}>Use MyWallet</button>

      <p>{questionId}</p>
      <h3>Question Id</h3>
      <InputBytes
        bytes={32}
        callback={setQuestionId}
        name="questionId"
        register={register}
        errors={errors.questionId}
      />

      <PreviewCondition oracle={oracleAddress} questionId={questionId} numOutcomes={numOutcomes} />

      <button
        disabled={!isValid}
        onClick={() => CTService.prepareCondition(questionId, oracleAddress, numOutcomes)}
      >
        Prepare Condition
      </button>
    </>
  )
}
