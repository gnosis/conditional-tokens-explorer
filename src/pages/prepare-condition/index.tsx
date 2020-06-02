import React, { useState } from 'react'
import { InputOutcomes } from '../../components/common/InputOutcomes'
import { InputAddress } from '../../components/common/InputAddress'
import { InputBytes } from '../../components/common/InputBytes'
import { PreviewCondition } from './PreviewCondition'
import { useWeb3Connected } from '../../hooks/useWeb3Context'

let renders = 0
export const PrepareConditionContainer = () => {
  renders++
  console.log('Render_PrepareCondition', renders)
  const [numOutcomes, setNumOutcomes] = useState(0)
  const [oracleAddress, setOracleAddress] = useState('')
  const [questionId, setQuestionId] = useState('')

  const { CTService } = useWeb3Connected()

  return (
    <>
      <p>{numOutcomes}</p>
      <h3>Outcomes number</h3>
      <InputOutcomes callback={setNumOutcomes} />

      <p>{oracleAddress}</p>
      <h3>Oracle Address</h3>
      <InputAddress callback={setOracleAddress} />

      <p>{questionId}</p>
      <h3>Question Id</h3>
      <InputBytes bytes={32} callback={setQuestionId} />
      <PreviewCondition oracle={oracleAddress} questionId={questionId} numOutcomes={numOutcomes} />

      <button onClick={() => CTService.prepareCondition(questionId, oracleAddress, numOutcomes)}>
        Prepare Condition
      </button>
    </>
  )
}
