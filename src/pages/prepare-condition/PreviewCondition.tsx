import React, { useEffect, useState } from 'react'
import { utils } from 'ethers'

interface Props {
  questionId: string
  numOutcomes: number
  oracle: string
}

export const PreviewCondition = ({ questionId, numOutcomes, oracle }: Props) => {
  const [conditionId, setConditionId] = useState('')
  useEffect(() => {
    // TODO Check values again isHexString, hexDataLength and getAddress(addr)
    if (questionId && numOutcomes && oracle) {
      const id = utils.solidityKeccak256(
        ['address', 'bytes32', 'uint'],
        [oracle, questionId, numOutcomes]
      )
      setConditionId(id)
    }
  }, [questionId, numOutcomes, oracle])
  console.log('conditionId', conditionId)

  return <h1>{conditionId}</h1>
}
