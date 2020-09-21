import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { Modal } from 'components/common/Modal'
import { SelectCondition } from 'components/form/SelectCondition'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListEmpty } from 'components/pureStyledComponents/StripedList'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { useConditionContext } from 'contexts/ConditionContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { OutcomesTable } from 'pages/ReportPayouts/OutcomesTable'
import { getLogger } from 'util/logger'
import { Status } from 'util/types'

export interface FormInputs {
  payouts: BigNumber[]
}

const DECIMALS = 2

const ORACLE_NOT_VALID_TO_REPORT_ERROR = 'The connected user is a not allowed to report payouts'
const PAYOUTS_POSITIVE_ERROR = 'At least one payout must be positive'

const logger = getLogger('ReportPayouts')

export const Contents: React.FC = () => {
  const { clearCondition, condition } = useConditionContext()
  const { _type: status, CTService, address, connect } = useWeb3ConnectedOrInfura()

  const [payoutEmptyError, setPayoutEmptyError] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<Maybe<Status>>(null)
  const [oracleNotValidError, setOracleNotValidError] = useState(false)
  const [error, setError] = useState<Maybe<Error>>(null)

  const isConditionResolved = useMemo(() => condition && condition.resolved, [condition])
  const questionId = useMemo(() => condition && condition.questionId, [condition])
  const oracle = useMemo(() => condition && condition.oracle, [condition])

  const formMethods = useForm<FormInputs>({ mode: 'onSubmit' })
  const {
    formState: { dirty },
    handleSubmit,
    watch,
  } = formMethods

  // Variable used to disable the submit button, check for payouts not empty and the oracle must be valid
  const disableSubmit =
    !dirty ||
    payoutEmptyError ||
    isConditionResolved ||
    (status === Web3ContextStatus.Connected && oracleNotValidError) ||
    transactionStatus === Status.Loading

  // Check if the sender is valid
  useEffect(() => {
    if (!oracle) return
    if (status === Web3ContextStatus.Connected && address) {
      setOracleNotValidError(oracle.toLowerCase() !== address.toLowerCase())
    } else {
      setOracleNotValidError(true)
    }
  }, [status, address, oracle])

  const watchPayouts = watch('payouts')

  // Validate payouts (positive, at least one non 0)
  useEffect(() => {
    if (watchPayouts && watchPayouts.length > 0 && dirty) {
      const nonZero = (currentValue: BigNumber) => !currentValue.isZero()
      setPayoutEmptyError(!watchPayouts.some(nonZero))
    }
  }, [watchPayouts, dirty])

  const onSubmit = async (data: FormInputs) => {
    // Validate exist at least one payout
    const { payouts } = data
    try {
      if (status === Web3ContextStatus.Connected) {
        setTransactionStatus(Status.Loading)

        const payoutsNumbered = payouts.map((payout: BigNumber) => payout.toNumber())
        await CTService.reportPayouts(questionId, payoutsNumbered)

        setTransactionStatus(Status.Ready)

        // Setting the condition to '', update the state of the provider and reload the HOC component, works like a reload
        clearCondition()
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setError(err)
      logger.error(err)
    } finally {
      setTransactionStatus(Status.Ready)
    }
  }

  return (
    <CenteredCard>
      <Row cols="1fr" marginBottomXL>
        <SelectCondition />
      </Row>
      {condition && !isConditionResolved && (
        <OutcomesTable condition={condition} decimals={DECIMALS} formMethods={formMethods} />
      )}
      {(!condition || isConditionResolved) && (
        <StripedList minHeight="120px">
          <StripedListEmpty>
            {!condition
              ? 'Please select a condition to report.'
              : 'The condition is already resolved.'}
          </StripedListEmpty>
        </StripedList>
      )}

      {transactionStatus === Status.Loading && (
        <FullLoading
          actionButton={
            error ? { text: 'OK', onClick: () => setTransactionStatus(Status.Ready) } : undefined
          }
          icon={error ? IconTypes.error : IconTypes.spinner}
          message={error ? error.message : 'Waiting...'}
          title={error ? 'Error' : 'Report payout'}
        />
      )}
      {transactionStatus === Status.Ready && (
        <Modal
          isOpen={transactionStatus === Status.Ready}
          onRequestClose={() => setTransactionStatus(null)}
          subTitle={'Report completed'}
          title={'Report Payouts'}
        ></Modal>
      )}
      <ErrorContainer>
        {payoutEmptyError && <Error>{PAYOUTS_POSITIVE_ERROR}</Error>}
        {status === Web3ContextStatus.Connected && oracleNotValidError && (
          <Error>{ORACLE_NOT_VALID_TO_REPORT_ERROR}</Error>
        )}
      </ErrorContainer>
      <ButtonContainer>
        <Button disabled={disableSubmit} onClick={handleSubmit(onSubmit)}>
          Report
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
