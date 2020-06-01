import React, { useState } from 'react'
import { InputOutcomes } from '../../components/common/InputOutcomes'
import { InputAddress } from '../../components/common/InputAddress'
import { InputBytes } from '../../components/common/InputBytes'

let renders = 0
export const PrepareConditionContainer = () => {
  renders++
  console.log('Render_PrepareCondition', renders)
  const [numOutcomes, setNumOutcomes] = useState(0)
  const [oracleAddress, setOracleAddress] = useState('')
  const [questionId, setQuestionId] = useState('')

  return (
    <>
      <p>{numOutcomes}</p>
      <InputOutcomes callback={setNumOutcomes} />

      <p>{oracleAddress}</p>
      <InputAddress callback={setOracleAddress} />

      <p>{questionId}</p>
      <InputBytes bytes={32} callback={setQuestionId} />
    </>
  )
}
