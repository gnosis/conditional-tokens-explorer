import { useState, useEffect } from 'react'

import { useWeb3Context } from '../contexts/Web3Context'
import { Question } from '../util/types'

export const useQuestion = (questionId: string) => {
  const { status } = useWeb3Context()

  const [question, setQuestion] = useState<Maybe<Question>>(null)
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (status._type === 'connected') {
      setLoading(true)
      const { RtioService } = status

      const getQuestion = async (questionId: string) => {
        try {
          const question = await RtioService.getQuestion(questionId)
          setQuestion(question)
        } catch (err) {
          setError(err)
        }
      }

      getQuestion(questionId)

      setLoading(false)
    }
  }, [status, questionId])

  return {
    question,
    error,
    loading,
  }
}
