import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Question } from 'util/types'

export const useQuestion = (questionId: string, outcomeSlotCount: number) => {
  const { RtioService, networkConfig } = useWeb3ConnectedOrInfura()

  const [question, setQuestion] = React.useState<Maybe<Question>>(null)
  const [outcomesPrettier, setOutcomesPrettier] = React.useState<string[]>([])
  const [error, setError] = React.useState(undefined)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    let cancelled = false
    if (!cancelled) setLoading(true)

    const getQuestion = async (questionId: string) => {
      try {
        const earliestBlockToCheck = networkConfig.getEarliestBlockToCheck()
        const question = await RtioService.getQuestion(questionId, earliestBlockToCheck)
        if (!cancelled) setQuestion(question)
      } catch (err) {
        setError(err)
      }
    }

    getQuestion(questionId)

    if (!cancelled) setLoading(false)

    return () => {
      cancelled = true
    }
  }, [RtioService, networkConfig, questionId])

  React.useEffect(() => {
    let cancelled = false
    if (!cancelled) setLoading(true)

    const outcomesSlots = question
      ? question.outcomes
      : Array.from(Array(outcomeSlotCount), (_, i) => i + '')

    if (!cancelled) setOutcomesPrettier(outcomesSlots)
    if (!cancelled) setLoading(false)

    return () => {
      cancelled = true
    }
  }, [question, outcomeSlotCount])

  return {
    question,
    outcomesPrettier,
    error,
    loading,
  }
}
