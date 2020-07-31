import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { BigNumber } from 'ethers/utils'

import { BigNumberInputWrapper } from 'components/common/BigNumberInputWrapper'
import { GetCondition_condition } from '../../types/generatedGQL'
import { useQuestion } from '../../hooks/useQuestion'
import { getTokenFromAddress } from '../../config/networkConfig'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { Token } from '../../util/types'
import { ZERO_BN } from '../../config/constants'
import { divBN } from '../../util/tools'

interface Props {
  condition: GetCondition_condition
}

interface Outcome {
  name: string
  probability: number
}

interface FormInputs {
  payouts: BigNumber[]
}

export const OutcomeSlotsToReport = ({ condition }: Props) => {
  const { networkConfig } = useWeb3Connected()

  const { questionId, outcomeSlotCount, positions } = condition

  let decimals = 18
  if (positions) {
    const { collateralToken } = positions[0]
    const { id: collateralAddress } = collateralToken
    const token: Token = getTokenFromAddress(networkConfig.networkId, collateralAddress)
    decimals = token.decimals
  }

  const { outcomesPrettier } = useQuestion(questionId, outcomeSlotCount)

  const [outcomes, setOutcomes] = React.useState<Outcome[]>([])

  React.useEffect(() => {
    let cancelled = false
    if (outcomes.length === 0) {
      const outcomes: Outcome[] = outcomesPrettier.map((outcome, index) => {
        return {
          name: outcome,
          probability: 0,
        }
      })
      if (!cancelled) setOutcomes(outcomes)
    }
    return () => {
      cancelled = true
    }
  }, [outcomesPrettier, outcomes.length])

  const { getValues, control, handleSubmit } = useForm<FormInputs>({ mode: 'onChange' })

  const onSubmit = (payouts: FormInputs) => {
    // Validate exist at least one payout
    console.log(payouts)
  }

  const onChange = (value: BigNumber, index: number) => {
    const values = Object.values(getValues())

    // Calculate total payouts entered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = values.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
      const payout = currentIndex === index ? value : currentValue
      return previousValue.add(payout)
    }, new BigNumber(0))

    // Calculate probabilities against the total calculated previously
    const outcomesValues: Outcome[] = (outcomes as Outcome[]).map((outcome, currentIndex) => {
      const amount = currentIndex === index ? value : (values[currentIndex] as BigNumber)
      const probability = divBN(amount, total as BigNumber) * 100
      return {
        ...outcome,
        probability,
      }
    })

    // Update the outcomes with the new probabilities
    setOutcomes(outcomesValues)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              const { name, probability } = outcome
              return (
                <tr key={index}>
                  <td>{name}</td>
                  <td>{probability.toFixed(2)}%</td>
                  <td>
                    <Controller
                      control={control}
                      name={`payouts[${index}]`}
                      decimals={decimals}
                      as={BigNumberInputWrapper}
                      defaultValue={new BigNumber(0)}
                      rules={{ required: true, validate: (amount) => amount.gte(ZERO_BN) }}
                      onChange={(value) => {
                        onChange(value[0], index)
                        return value[0]
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <input type="submit" />
      </form>
    </>
  )
}
