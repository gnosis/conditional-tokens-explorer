import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { BigNumber, formatUnits } from 'ethers/utils'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ZERO_BN } from '../../config/constants'
import { useConditionContext } from '../../contexts/ConditionContext'
import { useWeb3Context, Web3ContextStatus } from '../../contexts/Web3Context'
import { useQuestion } from '../../hooks/useQuestion'
import { GetCondition_condition } from '../../types/generatedGQL'
import { getLogger } from '../../util/logger'
import { divBN } from '../../util/tools'
import { Status } from '../../util/types'

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

const logger = getLogger('OutcomSlotsToReport')

const ORACLE_NOT_VALID_TO_REPORT_ERROR = 'The connected user is a not allowed to report payouts'
const PAYOUTS_POSITIVE_ERROR = 'At least one payout must be positive'

const DECIMALS = 2

export const OutcomeSlotsToReport = ({ condition }: Props) => {
  const { connect, status } = useWeb3Context()

  const { clearCondition } = useConditionContext()

  const { oracle, outcomeSlotCount, questionId } = condition

  const { outcomesPrettier } = useQuestion(questionId, outcomeSlotCount)

  const [outcomes, setOutcomes] = React.useState<Outcome[]>([])
  const [payoutEmptyError, setPayoutEmptyError] = React.useState(false)
  const [transactionStatus, setTransactionStatus] = React.useState<Maybe<Status>>(null)
  const [oracleNotValidError, setOracleNotValidError] = React.useState(true)
  const { control, getValues, handleSubmit, watch } = useForm<FormInputs>({ mode: 'onSubmit' })

  // Check if the sender is valid
  React.useEffect(() => {
      if (status._type === Web3ContextStatus.Connected) {
        const { address } = status
        setOracleNotValidError(oracle.toLowerCase() !== address.toLowerCase())
      } else {
        setOracleNotValidError(true)
      }
  }, [status, oracle])

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

  const onSubmit = async (data: FormInputs) => {
    // Validate exist at least one payout
    const { payouts } = data
    try {
      if (status._type === Web3ContextStatus.Connected) {
        const { CTService } = status

        setTransactionStatus(Status.Loading)

        const payoutsNumbered = payouts.map((payout: BigNumber) =>
          Number(formatUnits(payout, DECIMALS))
        )
        await CTService.reportPayouts(questionId, payoutsNumbered)

        setTransactionStatus(Status.Ready)

        // Setting the condition to '', update the state of the provider and reload the HOC component, works like a reload
        clearCondition()
      } else if (status._type === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Status.Error)
      logger.error(err)
    }
  }

  // Variable used to disable the submit button, check for payouts not empty and the oracle must be valid
  const disableSubmit = payoutEmptyError || (status._type === Web3ContextStatus.Connected && oracleNotValidError) || transactionStatus === Status.Loading

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
                      as={BigNumberInputWrapper}
                      control={control}
                      decimals={DECIMALS}
                      defaultValue={new BigNumber(0)}
                      name={`payouts[${index}]`}
                      onChange={(value) => {
                        onChange(value[0], index)
                        return value[0]
                      }}
                      rules={{ required: true, validate: (amount) => amount.gte(ZERO_BN) }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {payoutEmptyError && <p>{PAYOUTS_POSITIVE_ERROR}</p>}
        {status._type === Web3ContextStatus.Connected && oracleNotValidError && <p>{ORACLE_NOT_VALID_TO_REPORT_ERROR}</p>}
        <input disabled={disableSubmit} type="submit" />
      </form>
    </>
  )
}
