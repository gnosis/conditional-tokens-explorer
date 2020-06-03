import React, { useEffect, useState } from 'react'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { Maybe } from '../../contexts/Web3Context'

interface Props {
  questionId: string
  numOutcomes: number
  oracle: string
}

export const PreviewCondition = ({ questionId, numOutcomes, oracle }: Props) => {
  const [conditionId, setConditionId] = useState<Maybe<string>>(null)
  useEffect(() => {
    if (questionId && numOutcomes && oracle) {
      try {
        const id = ConditionalTokensService.getConditionId(questionId, oracle, numOutcomes)
        setConditionId(id)
      } catch (err) {
        setConditionId(null)
      }
    } else {
      setConditionId(null)
    }
  }, [questionId, numOutcomes, oracle])
  return conditionId ? <h1>conditionId</h1> : null
}
