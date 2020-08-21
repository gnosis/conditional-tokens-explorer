import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { BigNumber, formatUnits } from 'ethers/utils'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'

import { Button } from '../../components/buttons/Button'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from '../../components/pureStyledComponents/Error'
import { ZERO_BN } from '../../config/constants'
import { useConditionContext } from '../../contexts/ConditionContext'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { useQuestion } from '../../hooks/useQuestion'
import { GetCondition_condition } from '../../types/generatedGQL'
import { getLogger } from '../../util/logger'
import { divBN } from '../../util/tools'
import { Status } from '../../util/types'

const Wrapper = styled.form``

const TableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: none;
  width: 100%;
`

const Table = styled.table`
  border-collapse: initial;
  border-radius: 4px;
  border-spacing: 0;
  border: solid 1px ${(props) => props.theme.border.colorDark};
  min-width: 100%;
`

const THead = styled.thead``

const TH = styled.th<{ textAlign?: string }>`
  background-color: ${(props) => props.theme.colors.whitesmoke3};
  border: none;
  color: ${(props) => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 600;
  height: 37px;
  line-height: 1.2;
  padding: 0 23px;
  text-align: ${(props) => props.textAlign};
  text-transform: uppercase;
  white-space: nowrap;
`

TH.defaultProps = {
  textAlign: 'left',
}

const TR = styled.tr``

const TBody = styled.tbody``

const TD = styled.td<{ textAlign?: string }>`
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-top: solid 1px ${(props) => props.theme.border.colorDark};
  color: ${(props) => props.theme.colors.textColor};
  font-size: 15px;
  font-weight: 400;
  height: 39px;
  line-height: 1.2;
  padding: 0 23px;
  text-align: ${(props) => props.textAlign};
`

const Textfield = styled(BigNumberInputWrapper)`
  margin-left: auto;

  input {
    border-bottom: solid 1px ${(props) => props.theme.colors.textColor};
    border-left: none;
    border-radius: 0;
    border-right: none;
    border-top: none;
    color: ${(props) => props.theme.colors.textColor};
    font-size: 15px;
    font-weight: 400;
    height: auto;
    padding: 0 0 2px 0;
    text-align: right;
    width: 70px;

    &:focus {
      border-bottom-color: ${(props) => props.theme.colors.primary};
    }
  }
`

TH.defaultProps = {
  textAlign: 'left',
}

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

export const OutcomesTable = ({ condition }: Props) => {
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
  useEffect(() => {
    if (status._type === Web3ContextStatus.Connected) {
      const { address } = status
      setOracleNotValidError(oracle.toLowerCase() !== address.toLowerCase())
    } else {
      setOracleNotValidError(true)
    }
  }, [status, oracle])

  useEffect(() => {
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
  useEffect(() => {
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
      } as Outcome
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
  const disableSubmit =
    payoutEmptyError ||
    (status._type === Web3ContextStatus.Connected && oracleNotValidError) ||
    transactionStatus === Status.Loading

  return (
    <Wrapper onSubmit={handleSubmit(onSubmit)}>
      <TableWrapper>
        <Table>
          <THead>
            <TR>
              <TH>Outcome</TH>
              <TH textAlign="right">Probabilities</TH>
              <TH textAlign="right">Payout</TH>
            </TR>
          </THead>
          <TBody>
            {outcomes.map((outcome, index) => {
              const { name, probability } = outcome
              return (
                <TR key={index}>
                  <TD>{name}</TD>
                  <TD textAlign="right">{probability.toFixed(2)}%</TD>
                  <TD textAlign="right">
                    <Controller
                      as={Textfield}
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
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      </TableWrapper>
      <ErrorContainer>
        {payoutEmptyError && <Error>{PAYOUTS_POSITIVE_ERROR}</Error>}
        {status._type === Web3ContextStatus.Connected && oracleNotValidError && (
          <Error>{ORACLE_NOT_VALID_TO_REPORT_ERROR}</Error>
        )}
      </ErrorContainer>
      <ButtonContainer>
        <Button disabled={disableSubmit} type="submit">
          Report
        </Button>
      </ButtonContainer>
    </Wrapper>
  )
}
