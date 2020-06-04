import React, { useState } from 'react'
import { PreviewCondition } from './PreviewCondition'
import { useWeb3Connected } from '../../hooks/useWeb3Context'
import { useForm } from 'react-hook-form'
import { isAddress } from '../../util/tools'

const MIN_OUTCOMES = 2
const MAX_OUTCOMES = 256

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

const bytesRegex = /^0x[a-fA-F0-9]{64}$/
const addressRegex = /^0x[a-fA-F0-9]{40}$/

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
      <input
        name="outcomesSlotCount"
        onChange={(e) => setNumOutcomes(Number(e.target.value))}
        type="number"
        ref={register({ required: true, min: MIN_OUTCOMES, max: MAX_OUTCOMES })}
      ></input>
      {errors.outcomesSlotCount && (
        <div>
          {errors.outcomesSlotCount.type === 'max' && maxOutcomesError}
          {errors.outcomesSlotCount.type === 'min' && minOutcomesError}
          {errors.outcomesSlotCount.type === 'required' && 'Required field'}
        </div>
      )}

      <p>{oracleAddress}</p>
      <h3>Oracle Address</h3>
      <input
        name="oracle"
        onChange={(e) => setOracleAddress(e.target.value)}
        type="text"
        ref={register({
          required: true,
          pattern: addressRegex,
          validate: (value: string) => isAddress(value),
        })}
      ></input>
      {errors.oracle && (
        <div>
          {errors.oracle.type === 'pattern' && 'Invalid address'}
          {errors.oracle.type === 'validate' && 'Address checksum failed'}
        </div>
      )}
      <button
        onClick={() => {
          setValue('oracle', address, true)
          setOracleAddress(address)
        }}
      >
        Use MyWallet
      </button>

      <p>{questionId}</p>
      <h3>Question Id</h3>
      <input
        name="questionId"
        onChange={(e) => setQuestionId(e.target.value)}
        type="text"
        ref={register({ required: true, pattern: bytesRegex })}
      ></input>
      {errors.questionId && (
        <div>{errors.questionId.type === 'pattern' && 'Invalid bytes32 string'}</div>
      )}

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
