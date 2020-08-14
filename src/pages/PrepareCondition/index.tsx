import React from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { ADDRESS_REGEX, BYTES_REGEX, MAX_OUTCOMES, MIN_OUTCOMES } from '../../config/constants'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { isAddress } from '../../util/tools'

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

export const PrepareCondition = () => {
  const [numOutcomes, setNumOutcomes] = React.useState(0)
  const [oracleAddress, setOracleAddress] = React.useState('')
  const [questionId, setQuestionId] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Maybe<Error>>(null)

  const { connect, status } = useWeb3Context()

  const {
    errors,
    formState: { isValid },
    register,
    setValue,
  } = useForm<{ outcomesSlotCount: number; oracle: string; questionId: string }>({
    mode: 'onChange',
  })

  const history = useHistory()

  const conditionId = isValid
    ? ConditionalTokensService.getConditionId(questionId, oracleAddress, numOutcomes)
    : null

  const prepareCondition = async () => {
    if (!conditionId) return
    setError(null)
    setIsLoading(true)
    try {
      if (status._type === Web3ContextStatus.Connected) {
        const { CTService, provider } = status

        const conditionExists = await CTService.conditionExists(conditionId)
        if (!conditionExists) {
          const tx = await CTService.prepareCondition(questionId, oracleAddress, numOutcomes)
          await provider.waitForTransaction(tx)

          history.push(`/conditions/${conditionId}`)
        } else {
          setError(new Error('Condition already exists'))
        }
      } else if (status._type === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (e) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    setError(null)
  }, [questionId, oracleAddress, numOutcomes])

  const submitDisabled = !isValid || isLoading

  const onClickUseMyWallet = () => {
    if (status._type === Web3ContextStatus.Connected) {
      const { address } = status
      setValue('oracle', address, true)
      setOracleAddress(address)
    } else if (status._type === Web3ContextStatus.Infura) {
      connect()
    }
  }

  return (
    <>
      <p>{numOutcomes}</p>
      <h3>Outcomes number</h3>
      <input
        name="outcomesSlotCount"
        onChange={(e) => setNumOutcomes(Number(e.target.value))}
        ref={register({ required: true, min: MIN_OUTCOMES, max: MAX_OUTCOMES })}
        type="number"
      />
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
        ref={register({
          required: true,
          pattern: ADDRESS_REGEX,
          validate: (value: string) => isAddress(value),
        })}
        type="text"
      />
      {errors.oracle && (
        <div>
          {errors.oracle.type === 'pattern' && 'Invalid address'}
          {errors.oracle.type === 'validate' && 'Address checksum failed'}
        </div>
      )}
      <button onClick={onClickUseMyWallet}>Use MyWallet</button>

      <p>{questionId}</p>
      <h3>Question Id</h3>
      <input
        name="questionId"
        onChange={(e) => setQuestionId(e.target.value)}
        ref={register({ required: true, pattern: BYTES_REGEX })}
        type="text"
      />
      {errors.questionId && (
        <div>{errors.questionId.type === 'pattern' && 'Invalid bytes32 string'}</div>
      )}
      {conditionId ? <h1>{conditionId}</h1> : null}
      <button disabled={submitDisabled} onClick={prepareCondition}>
        Prepare Condition
      </button>
      <p>{error && error.message}</p>
    </>
  )
}
