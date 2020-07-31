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

const ORACLE_NOT_VALID_TO_REPORT_ERROR = 'The connected user is a not allowed to report payouts'
const PAYOUTS_POSITIVE_ERROR = 'At least one payout must be positive'

export const OutcomeSlotsToReport = ({ condition }: Props) => {
  const { networkConfig, address } = useWeb3Connected()

  const { questionId, outcomeSlotCount, positions, oracle } = condition

  const { outcomesPrettier } = useQuestion(questionId, outcomeSlotCount)

  const [outcomes, setOutcomes] = React.useState<Outcome[]>([])
  const [payoutEmptyError, setPayoutEmptyError] = React.useState(false)
  const { getValues, control, handleSubmit, watch } = useForm<FormInputs>({ mode: 'onChange' })

  // Check if the sender is valid
  const oracleNotValidError = oracle !== address

  // Calculate the decimals of the collateral used in the positions of the condition
  let decimals = 18
  if (positions) {
    const { collateralToken } = positions[0]
    const { id: collateralAddress } = collateralToken
    const token: Token = getTokenFromAddress(networkConfig.networkId, collateralAddress)
    decimals = token.decimals
  }

  React.useEffect(() => {
    let cancelled = false
    if (outcomes.length === 0) {
      const outcomes: Outcome[] = outcomesPrettier.map((outcome) => {
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

  const watchPayouts = watch('payouts')

  // Validate payouts (positive, at least one non 0)
  React.useEffect(() => {
    if (watchPayouts && watchPayouts.length > 0) {
      const nonZero = (currentValue: BigNumber) => !currentValue.isZero()
      setPayoutEmptyError(!watchPayouts.some(nonZero))
    }
  }, [watchPayouts])

  const onSubmit = (data: FormInputs) => {
    // Validate exist at least one payout
    const { payouts } = data
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
      const probability = (total as BigNumber).isZero()
        ? 0
        : divBN(amount, total as BigNumber) * 100
      return {
        ...outcome,
        probability,
      }
    })

    // Update the outcomes with the new probabilities
    setOutcomes(outcomesValues)
  }

  // Variable used to disable the submit button, check for payouts not empty and the oracle must be valid
  const disableSubmit = payoutEmptyError || oracleNotValidError

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
        {payoutEmptyError && <p>{PAYOUTS_POSITIVE_ERROR}</p>}
        {oracleNotValidError && <p>{ORACLE_NOT_VALID_TO_REPORT_ERROR}</p>}
        <input type="submit" disabled={disableSubmit} />
      </form>
    </>
  )
}
