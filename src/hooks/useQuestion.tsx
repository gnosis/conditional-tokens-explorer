import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { getLogger } from 'util/logger'
import { Question } from 'util/types'

const logger = getLogger('UseQuestion')

export const useQuestion = (questionId: string, outcomeSlotCount: number) => {
  const { RtyService, networkConfig } = useWeb3ConnectedOrInfura()

  const [question, setQuestion] = React.useState<Maybe<Question>>(null)
  const [outcomesPrettier, setOutcomesPrettier] = React.useState<string[]>([])
  const [error, setError] = React.useState(undefined)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    setLoading(true)

    const getQuestion = async () => {
      let question = null
      try {
        const earliestBlockToCheck = networkConfig.getEarliestBlockToCheck()
        question = await RtyService.getQuestion(questionId, earliestBlockToCheck)
      } catch (err) {
        logger.error(err.message)
        setError(err)
      }
      const outcomesSlots = question
        ? question?.outcomes
        : Array.from(Array(outcomeSlotCount), (_, i) => i + '')

      setQuestion(question)
      setOutcomesPrettier(outcomesSlots)
    }

    getQuestion()

    setLoading(false)
  }, [RtyService, networkConfig, questionId, outcomeSlotCount])

  return {
    question,
    outcomesPrettier,
    error,
    loading,
  }
}
