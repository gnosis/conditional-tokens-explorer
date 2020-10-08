import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from 'components/buttons'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
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
import { Remote } from 'util/remoteData'

export interface FormInputs {
  payouts: BigNumber[]
}

const DECIMALS = 2

const logger = getLogger('ReportPayouts')

export const Contents: React.FC = () => {
  const { clearCondition, condition } = useConditionContext()
  const { _type: status, CTService, address, connect } = useWeb3ConnectedOrInfura()

  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const isConditionResolved = useMemo(() => condition && condition.resolved, [condition])
  const questionId = useMemo(() => condition && condition.questionId, [condition])
  const oracle = useMemo(() => condition && condition.oracle, [condition])

  const formMethods = useForm<FormInputs>({ mode: 'onSubmit' })
  const {
    formState: { dirty },
    handleSubmit,
    watch,
  } = formMethods

  const watchPayouts = watch('payouts')

  const isOracleValidToReportPayout = useMemo(
    () => address && oracle && oracle.toLowerCase() !== address.toLowerCase(),
    [address, oracle]
  )
  // Validate payouts (positive, at least one non 0)
  const isPayoutEmpty = useMemo(() => {
    if (watchPayouts && watchPayouts.length > 0 && dirty) {
      const nonZero = (currentValue: BigNumber) => !currentValue.isZero()
      return !watchPayouts.some(nonZero)
    } else {
      return false
    }
  }, [watchPayouts, dirty])

  // Variable used to disable the submit button, check for payouts not empty and the oracle must be valid
  const disableSubmit =
    !dirty ||
    isPayoutEmpty ||
    isConditionResolved ||
    (status === Web3ContextStatus.Connected && isOracleValidToReportPayout) ||
    transactionStatus.isLoading()

  const onSubmit = async (data: FormInputs) => {
    // Validate exist at least one payout
    const { payouts } = data
    try {
      if (status === Web3ContextStatus.Connected) {
        setTransactionStatus(Remote.loading())

        const payoutsNumbered = payouts.map((payout: BigNumber) => payout.toNumber())
        await CTService.reportPayouts(questionId, payoutsNumbered)

        setTransactionStatus(Remote.success(questionId))

        // Setting the condition to '', update the state of the provider and reload the HOC component, works like a reload
        clearCondition()
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Remote.failure(err))
      logger.error(err)
    }
  }

  const fullLoadingActionButton = transactionStatus.isFailure()
    ? {
        buttonType: ButtonType.danger,
        onClick: () => setTransactionStatus(Remote.notAsked<Maybe<string>>()),
        text: 'Close',
      }
    : transactionStatus.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        onClick: () => setTransactionStatus(Remote.notAsked<Maybe<string>>()),
        text: 'OK',
      }
    : undefined

  const fullLoadingMessage = transactionStatus.isFailure()
    ? transactionStatus.getFailure()
    : transactionStatus.isLoading()
    ? 'Working...'
    : 'Report finished!'

  const fullLoadingTitle = transactionStatus.isFailure() ? 'Error' : 'Report Payouts'

  const fullLoadingIcon = transactionStatus.isFailure()
    ? IconTypes.error
    : transactionStatus.isLoading()
    ? IconTypes.spinner
    : IconTypes.ok

  const isWorking =
    transactionStatus.isLoading() || transactionStatus.isFailure() || transactionStatus.isSuccess()

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
      {isWorking && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={fullLoadingTitle}
        />
      )}

      <ErrorContainer>
        {isPayoutEmpty && <Error>At least one payout must be positive</Error>}
        {status === Web3ContextStatus.Connected && isOracleValidToReportPayout && (
          <Error>The connected user is a not allowed to report payouts</Error>
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
