import React, { useEffect, useState } from 'react'
import { ConditionalTokensService } from '../../services/conditionalTokens'

interface Props {
  questionId: string
  numOutcomes: number
  oracle: string
}

export const PreviewCondition = ({ questionId, numOutcomes, oracle }: Props) => {
  const [conditionId, setConditionId] = useState('')
  useEffect(() => {
    if (questionId && numOutcomes && oracle) {
      const id = ConditionalTokensService.getConditionId(questionId, oracle, numOutcomes)
      setConditionId(id)
    }
  }, [questionId, numOutcomes, oracle])

  return <h1>{conditionId}</h1>
}
