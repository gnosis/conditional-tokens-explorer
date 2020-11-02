import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { StripedList, StripedListEmpty } from 'components/pureStyledComponents/StripedList'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { SelectableConditionTable } from 'components/table/SelectableConditionTable'
import { useConditionContext } from 'contexts/ConditionContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { OutcomesTable } from 'pages/ReportPayouts/OutcomesTable'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
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

  const isPayoutEmpty = useMemo(() => {
    if (watchPayouts && watchPayouts.length > 0 && dirty) {
      const nonZero = (currentValue: BigNumber) => !currentValue.isZero()
      return !watchPayouts.some(nonZero)
    } else {
      return false
    }
  }, [watchPayouts, dirty])

  const disableSubmit =
    !dirty ||
    isPayoutEmpty ||
    isConditionResolved ||
    (status === Web3ContextStatus.Connected && isOracleValidToReportPayout) ||
    transactionStatus.isLoading()

  const onSubmit = async (data: FormInputs) => {
    const { payouts } = data
    try {
      if (status === Web3ContextStatus.Connected && questionId) {
        setTransactionStatus(Remote.loading())

        const payoutsNumbered = payouts.map((payout: BigNumber) => payout.toNumber())
        await CTService.reportPayouts(questionId, payoutsNumbered)

        setTransactionStatus(Remote.success(questionId))
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

  const [selectedConditionId, setSelectedConditionId] = useState<string | undefined>()
  const onRowClicked = useCallback((row: Conditions_conditions) => {
    setSelectedConditionId(row.id)
  }, [])

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
      <SelectableConditionTable
        onRowClicked={onRowClicked}
        selectedConditionId={selectedConditionId}
      />
      {condition && !isConditionResolved ? (
        <OutcomesTable condition={condition} decimals={DECIMALS} formMethods={formMethods} />
      ) : (
        <StripedList minHeight="120px">
          <StripedListEmpty>
            {!condition && 'Please select a condition.'}
            {isConditionResolved && 'The condition is already resolved.'}
          </StripedListEmpty>
        </StripedList>
      )}
      <ErrorContainer>
        {isPayoutEmpty && <Error>At least one payout must be positive</Error>}
        {status === Web3ContextStatus.Connected && isOracleValidToReportPayout && (
          <Error>The connected user is a not allowed to report payouts</Error>
        )}
      </ErrorContainer>
      {isWorking && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={fullLoadingTitle}
        />
      )}
      <Prompt
        message={(params) =>
          params.pathname === '/report'
            ? true
            : 'Are you sure you want to leave this page? The changes you made will be lost.'
        }
        when={dirty || !!condition}
      />
      <ButtonContainer>
        <Button disabled={disableSubmit} onClick={handleSubmit(onSubmit)}>
          Report
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
