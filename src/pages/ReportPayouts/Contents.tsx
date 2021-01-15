import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { SelectableConditionTable } from 'components/table/SelectableConditionTable'
import { TitleValue } from 'components/text/TitleValue'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useCondition } from 'hooks/useCondition'
import { OutcomesTable } from 'pages/ReportPayouts/OutcomesTable'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'

const logger = getLogger('ReportPayouts')

export const Contents: React.FC = () => {
  const {
    _type: status,
    CPKService,
    CTService,
    address: walletAddress,
    connect,
    cpkAddress,
    isUsingTheCPKAddress,
  } = useWeb3ConnectedOrInfura()

  const activeAddress = useMemo(() => {
    return isUsingTheCPKAddress() ? cpkAddress : walletAddress
  }, [isUsingTheCPKAddress, cpkAddress, walletAddress])

  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const [conditionId, setConditionId] = useState<string>('')
  const [payouts, setPayouts] = useState<number[]>([])

  const { condition, loading: loadingCondition } = useCondition(conditionId)

  const questionId = useMemo(() => condition && condition.questionId, [condition])
  const outcomeSlotCount = useMemo(() => condition && condition.outcomeSlotCount, [condition])
  const [isDirty, setIsDirty] = useState(false)
  const [resetFilterUpdate, setResetFilterUpdate] = useState(false)

  const isConditionResolved = useMemo(() => condition && condition.resolved, [condition])
  const oracle = useMemo(() => condition && condition.oracle, [condition])

  const isOracleValidToReportPayout = useMemo(
    () => activeAddress && oracle && oracle.toLowerCase() === activeAddress.toLowerCase(),
    [activeAddress, oracle]
  )

  const isPayoutsEmpty = useMemo(() => !payouts.some((currentValue: number) => currentValue > 0), [
    payouts,
  ])

  useEffect(() => {
    if (outcomeSlotCount) setPayouts(new Array(outcomeSlotCount).fill(0))
  }, [outcomeSlotCount])

  const onReportPayout = useCallback(async () => {
    try {
      if (status === Web3ContextStatus.Connected && questionId && CPKService) {
        setTransactionStatus(Remote.loading())

        if (isUsingTheCPKAddress()) {
          await CPKService.reportPayouts({
            CTService,
            questionId,
            payouts,
          })
        } else {
          await CTService.reportPayouts(questionId, payouts)
        }

        setTransactionStatus(Remote.success(questionId))
        setIsDirty(false)
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Remote.failure(err))
      logger.error(err)
    }
  }, [status, isUsingTheCPKAddress, payouts, CPKService, connect, questionId, CTService])

  const onRowClicked = useCallback(
    (row: GetCondition_condition) => {
      setConditionId(row.id)
      setPayouts([])
      setIsDirty(false)
      logger.log(`OnRowClicked`)
    },
    [setConditionId, setPayouts]
  )

  const clearComponent = useCallback(() => {
    setConditionId('')
    setPayouts([])
    setTransactionStatus(Remote.notAsked<Maybe<string>>())
    logger.log(`ClearComponent`)
  }, [])

  const fullLoadingActionButton = useMemo(
    () =>
      transactionStatus.isFailure()
        ? {
            buttonType: ButtonType.danger,
            onClick: () => setTransactionStatus(Remote.notAsked<Maybe<string>>()),
            text: 'Close',
          }
        : transactionStatus.isSuccess()
        ? {
            buttonType: ButtonType.primary,
            onClick: () => {
              clearComponent()
            },
            text: 'OK',
          }
        : undefined,
    [transactionStatus, clearComponent]
  )

  const fullLoadingMessage = useMemo(
    () =>
      transactionStatus.isFailure()
        ? transactionStatus.getFailure()
        : transactionStatus.isLoading()
        ? 'Working...'
        : `Report payout finished! The reported array is [${payouts.toString()}]`,
    [transactionStatus, payouts]
  )

  const fullLoadingTitle = useMemo(
    () => (transactionStatus.isFailure() ? 'Error' : 'Report Payouts'),
    [transactionStatus]
  )

  const fullLoadingIcon = useMemo(
    () =>
      transactionStatus.isFailure()
        ? IconTypes.error
        : transactionStatus.isLoading()
        ? IconTypes.spinner
        : IconTypes.ok,
    [transactionStatus]
  )

  const isWorking = useMemo(
    () =>
      transactionStatus.isLoading() ||
      transactionStatus.isFailure() ||
      transactionStatus.isSuccess(),
    [transactionStatus]
  )

  const disabled = useMemo(
    () =>
      isPayoutsEmpty ||
      isConditionResolved ||
      status !== Web3ContextStatus.Connected ||
      !isOracleValidToReportPayout ||
      transactionStatus.isLoading(),
    [isPayoutsEmpty, isConditionResolved, status, isOracleValidToReportPayout, transactionStatus]
  )

  const setPayout = useCallback(
    (payout: number, index: number) => {
      const newArrPayout = [...payouts]
      newArrPayout[index] = payout
      setPayouts(newArrPayout)
      setIsDirty(true)
      logger.log(`SetPayout`)
    },
    [payouts]
  )

  const isNotAllowedToReportPayout = useMemo(
    () => condition && status === Web3ContextStatus.Connected && !isOracleValidToReportPayout,
    [condition, status, isOracleValidToReportPayout]
  )
  const isNotConnected = useMemo(() => condition && status !== Web3ContextStatus.Connected, [
    condition,
    status,
  ])
  const isPayoutPositive = useMemo(
    () => condition && status === Web3ContextStatus.Connected && isDirty && isPayoutsEmpty,
    [condition, status, isDirty, isPayoutsEmpty]
  )

  useEffect(() => {
    setResetFilterUpdate(!resetFilterUpdate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const thereAreErrors = useMemo(
    () => isNotAllowedToReportPayout || isNotConnected || isPayoutPositive || isConditionResolved,
    [isNotAllowedToReportPayout, isNotConnected, isPayoutPositive, isConditionResolved]
  )

  return (
    <CenteredCard>
      <SelectableConditionTable
        allowToDisplayOnlyConditionsToReport={true}
        onClearSelection={() => {
          clearComponent()
        }}
        onRowClicked={onRowClicked}
        refetch={transactionStatus.isSuccess()}
        resetFilterUpdate={resetFilterUpdate}
        selectedConditionId={conditionId}
      />
      <TitleValue
        title="Payouts"
        value={
          <>
            <OutcomesTable
              conditionId={condition && condition.id}
              isLoading={loadingCondition}
              outcomeSlotCount={outcomeSlotCount}
              payouts={payouts}
              setPayout={setPayout}
            />
            {thereAreErrors && (
              <ErrorContainer>
                {isNotAllowedToReportPayout && (
                  <Error>The connected user is a not allowed to report payouts.</Error>
                )}
                {isNotConnected && <Error>Please connect to your wallet to report payouts.</Error>}
                {isPayoutPositive && <Error>At least one payout must be positive.</Error>}
                {isConditionResolved && <Error>Condition is already resolved.</Error>}
              </ErrorContainer>
            )}
          </>
        }
      />
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
        when={isDirty}
      />
      <ButtonContainer>
        <Button disabled={disabled} onClick={onReportPayout}>
          Report
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
