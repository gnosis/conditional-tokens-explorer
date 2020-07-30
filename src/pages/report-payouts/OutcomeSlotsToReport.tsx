import React from 'react'
import { BigNumber } from 'ethers/utils'

import { GetCondition_condition } from '../../types/generatedGQL'
import { useQuestion } from '../../hooks/useQuestion'
import { formatBigNumber } from '../../util/tools'

interface Props {
  condition: GetCondition_condition
}

interface Outcome {
  name: string
  probability: number
  payout: BigNumber
}

export const OutcomeSlotsToReport = ({ condition }: Props) => {
  const { questionId, outcomeSlotCount } = condition
  const { outcomesPrettier } = useQuestion(questionId, outcomeSlotCount)

  const outcomes: Outcome[] = outcomesPrettier.map((outcome, index) => {
    return {
      name: outcome,
      probability: 0,
      payout: new BigNumber(0),
    }
  })

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Outcome</th>
            <th>Probabilities</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {outcomes.map((outcome, index) => {
            const { name, probability, payout } = outcome
            return (
              <tr key={index}>
                <td>{name}</td>
                <td>{probability.toFixed(2)}%</td>
                <td>{formatBigNumber(payout, 18)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
