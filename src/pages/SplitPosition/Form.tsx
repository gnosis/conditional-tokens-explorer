import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Prompt } from 'react-router'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { Modal } from 'components/common/Modal'
import { SetAllowance } from 'components/common/SetAllowance'
import { DisplayTablePositionsWrapper } from 'components/form/DisplayTablePositions'
import { InputAmount } from 'components/form/InputAmount'
import { EditPartitionModal } from 'components/modals/EditPartitionModal'
import { Outcome } from 'components/partitions/Outcome'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { CardTextSm } from 'components/pureStyledComponents/CardText'
import { OutcomesContainer } from 'components/pureStyledComponents/OutcomesContainer'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItemLessPadding,
} from 'components/pureStyledComponents/StripedList'
import { TitleControlButton } from 'components/pureStyledComponents/TitleControl'
import { PositionPreview } from 'components/splitPosition/PositionPreview'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { StatusInfoInline, StatusInfoType } from 'components/statusInfo/StatusInfoInline'
import { IconTypes } from 'components/statusInfo/common'
import { SelectableConditionTable } from 'components/table/SelectableConditionTable'
import { TitleValue } from 'components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from 'config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useAllowance } from 'hooks/useAllowance'
import { useAllowanceState } from 'hooks/useAllowanceState'
import { useCollateral } from 'hooks/useCollateral'
import { useCondition } from 'hooks/useCondition'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { SplitFrom } from 'pages/SplitPosition/SplitFrom'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { indexSetFromOutcomes, trivialPartition, truncateStringInTheMiddle } from 'util/tools'
import {
  LocalStorageManagement,
  OutcomeProps,
  PositionIdsArray,
  SplitFromType,
  SplitStatus,
  Token,
} from 'util/types'

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

export type SplitFrom = 'collateral' | 'position'

export type SplitPositionFormMethods = {
  amount: BigNumber
  collateral: string
  conditionId: string
  positionId: string
  splitFrom: SplitFromType
}

interface Props {
  tokens: Token[]
}

const logger = getLogger('Form')

export const Form = (props: Props) => {
  const { _type: status, CTService, connect } = useWeb3ConnectedOrInfura()
  const { tokens } = props

  const { getValue } = useLocalStorage(LocalStorageManagement.PositionId)
  const defaultSplitFrom = getValue(false) ? SplitFromType.position : SplitFromType.collateral

  const [conditionId, setConditionId] = useState('')
  const [position, setPosition] = useState<Maybe<PositionWithUserBalanceWithDecimals>>(null)
  const [collateralAddress, setCollateralAddress] = useState(tokens[0].address)
  const [amount, setAmount] = useState(ZERO_BN)
  const [splitFrom, setSplitFrom] = useState(defaultSplitFrom)
  const [originalPartition, setOriginalPartition] = useState<BigNumber[]>([])
  const [numberedOutcomes, setNumberedOutcomes] = useState<Array<Array<OutcomeProps>>>([])

  const [isEditPartitionModalOpen, setIsEditPartitionModalOpen] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<Remote<SplitStatus>>(
    Remote.notAsked<SplitStatus>()
  )

  const allowanceMethods = useAllowance(collateralAddress)
  const { collateral } = useCollateral(collateralAddress)

  const condition = useCondition(conditionId)
  const outcomeSlot = useMemo(() => (condition ? condition.outcomeSlotCount : 0), [condition])
  const conditionIdToPreviewShow = useMemo(() => (condition ? condition.id : ''), [condition])

  useEffect(() => {
    setOriginalPartition(trivialPartition(outcomeSlot))
  }, [outcomeSlot])

  useEffect(() => {
    const numberedOutcomesToSet = originalPartition.map((outcome: BigNumber, key: number) => {
      return [{ value: key, id: outcome.toString() }]
    })
    setNumberedOutcomes(numberedOutcomesToSet)
  }, [originalPartition, setNumberedOutcomes])

  const partition = useMemo(() => {
    const outcomes = numberedOutcomes.map((collection) => collection.map((c) => c.id))
    return outcomes.map(indexSetFromOutcomes).map((o) => new BigNumber(o))
  }, [numberedOutcomes])

  const resetState = useCallback(() => {
    setConditionId('')
    setCollateralAddress(tokens[0].address)
    setAmount(ZERO_BN)
    setPosition(null)
    setIsDirty(false)
  }, [tokens])

  const isSplittingFromCollateral = useMemo(() => splitFrom === SplitFromType.collateral, [
    splitFrom,
  ])
  const isSplittingFromPosition = useMemo(() => splitFrom === SplitFromType.position, [splitFrom])

  const onEditPartitionSave = useCallback((numberedOutcomes: Array<Array<OutcomeProps>>) => {
    setIsEditPartitionModalOpen(false)
    setNumberedOutcomes(numberedOutcomes)
  }, [])

  const onSubmit = useCallback(async () => {
    try {
      if (status === Web3ContextStatus.Connected) {
        setTransactionStatus(Remote.loading())

        let positionIds: PositionIdsArray[]
        let collateralFromSplit: string = collateralAddress

        if (isSplittingFromCollateral) {
          await CTService.splitPosition(
            collateralFromSplit,
            NULL_PARENT_ID,
            conditionId,
            partition,
            amount
          )

          positionIds = await CTService.getPositionsFromPartition(
            partition,
            NULL_PARENT_ID,
            conditionId,
            collateralFromSplit
          )
        } else if (
          isSplittingFromPosition &&
          position &&
          position.collateralToken &&
          position.collection
        ) {
          collateralFromSplit = position.collateralToken
          const collectionId = position.collection.id

          await CTService.splitPosition(
            collateralFromSplit,
            collectionId,
            conditionId,
            partition,
            amount
          )

          positionIds = await CTService.getPositionsFromPartition(
            partition,
            collectionId,
            conditionId,
            collateralFromSplit
          )
        } else {
          throw Error('Invalid split origin')
        }

        setTransactionStatus(Remote.success({ positionIds, collateral: collateralFromSplit }))
        setIsDirty(false)
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      logger.error(err)
      setTransactionStatus(Remote.failure(err))
    }
  }, [
    CTService,
    connect,
    status,
    partition,
    isSplittingFromCollateral,
    isSplittingFromPosition,
    position,
    amount,
    collateralAddress,
    conditionId,
  ])

  const clearComponent = useCallback(() => {
    resetState()
    // Clear status to notAsked, so we can close the modal
    setTransactionStatus(Remote.notAsked<SplitStatus>())
  }, [resetState, setTransactionStatus])

  const {
    allowanceError,
    allowanceFinished,
    cleanAllowanceError,
    fetchingAllowance,
    shouldDisplayAllowance,
    unlockCollateral,
  } = useAllowanceState(allowanceMethods, amount)

  const isAllowanceVisible = useMemo(() => isSplittingFromCollateral && shouldDisplayAllowance, [
    shouldDisplayAllowance,
    isSplittingFromCollateral,
  ])

  const isValid = useMemo(
    () =>
      conditionId &&
      condition &&
      (isSplittingFromCollateral ? collateralAddress : position) &&
      !amount.isZero(),
    [conditionId, condition, position, collateralAddress, amount, isSplittingFromCollateral]
  )

  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (conditionId || condition || position || !amount.isZero()) {
      setIsDirty(true)
    }
  }, [conditionId, condition, position, amount])

  const canSubmit = useMemo(
    () => (isSplittingFromCollateral ? isValid && allowanceFinished : isValid),
    [isSplittingFromCollateral, isValid, allowanceFinished]
  )

  const outcomesByRow = '14'

  const fullLoadingActionButton = useMemo(
    () =>
      transactionStatus.isSuccess()
        ? {
            buttonType: ButtonType.primary,
            onClick: () => clearComponent(),
            text: 'OK',
          }
        : transactionStatus.isFailure()
        ? {
            buttonType: ButtonType.danger,
            text: 'Close',
            onClick: () => setTransactionStatus(Remote.notAsked<SplitStatus>()),
          }
        : undefined,
    [transactionStatus, clearComponent]
  )

  const fullLoadingIcon = useMemo(
    () =>
      transactionStatus.isFailure()
        ? IconTypes.error
        : transactionStatus.isSuccess()
        ? IconTypes.ok
        : IconTypes.spinner,
    [transactionStatus]
  )

  const fullLoadingMessage = useMemo(
    () =>
      transactionStatus.isFailure()
        ? transactionStatus.getFailure()
        : transactionStatus.isLoading()
        ? 'Working...'
        : undefined,
    [transactionStatus]
  )

  const splitPositionsTable = useMemo(
    () =>
      transactionStatus.isSuccess() && transactionStatus.hasData() ? (
        <DisplayTablePositionsWrapper
          callbackOnHistoryPush={clearComponent}
          collateral={transactionStatus.get().collateral}
          positionIds={transactionStatus.get().positionIds}
        />
      ) : null,
    [transactionStatus, clearComponent]
  )

  const onRowClicked = useCallback((row: Conditions_conditions) => {
    setConditionId(row.id)
  }, [])

  return (
    <CenteredCard>
      <SelectableConditionTable
        onClearSelection={() => clearComponent()}
        onRowClicked={onRowClicked}
        refetch={transactionStatus.isSuccess()}
        selectedConditionId={conditionId}
      />
      {condition && condition.resolved && (
        <Row cols="1fr">
          <StatusInfoInline status={StatusInfoType.warning}>
            This condition is already resolved.
          </StatusInfoInline>
        </Row>
      )}
      <Row cols="1fr" marginBottomXL>
        {collateral && (
          <TitleValue
            title="Split From"
            value={
              <SplitFrom
                cleanAllowanceError={cleanAllowanceError}
                collateral={collateral}
                onCollateralChange={setCollateralAddress}
                onPositionChange={setPosition}
                onSplitFromChange={setSplitFrom}
                position={position}
                splitFrom={splitFrom}
                tokens={tokens}
              />
            }
          />
        )}
      </Row>
      {isAllowanceVisible && collateral && (
        <SetAllowance
          collateral={collateral}
          error={allowanceError}
          fetching={fetchingAllowance}
          finished={allowanceFinished}
          onUnlock={unlockCollateral}
        />
      )}
      <Row cols="1fr" marginBottomXL>
        {collateral && (
          <InputAmount
            amount={amount}
            collateral={collateral}
            onAmountChange={(value: BigNumber) => setAmount(value)}
            position={position}
            splitFrom={splitFrom}
          />
        )}
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Partition"
          titleControl={
            <TitleControlButton
              disabled={!conditionIdToPreviewShow}
              onClick={() => setIsEditPartitionModalOpen(true)}
            >
              Edit Partition
            </TitleControlButton>
          }
          value={
            <>
              <CardTextSm>Outcomes Collections</CardTextSm>
              <StripedListStyled>
                {numberedOutcomes && numberedOutcomes.length ? (
                  numberedOutcomes.map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (outcomeList: OutcomeProps[], outcomeListIndex: number) => {
                      return (
                        <StripedListItemLessPadding key={outcomeListIndex}>
                          <OutcomesContainer columnGap="0" columns={outcomesByRow}>
                            {outcomeList.map((outcome: OutcomeProps, outcomeIndex: number) => (
                              <Outcome
                                key={outcomeIndex}
                                lastInRow={outcomesByRow}
                                outcome={outcome}
                              />
                            ))}
                          </OutcomesContainer>
                        </StripedListItemLessPadding>
                      )
                    }
                  )
                ) : (
                  <StripedListEmpty>No Collections.</StripedListEmpty>
                )}
              </StripedListStyled>
            </>
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        {collateral && (
          <PositionPreview
            amount={amount}
            conditionId={conditionIdToPreviewShow}
            partition={partition}
            position={position}
            selectedCollateral={collateral}
            splitFrom={splitFrom}
          />
        )}
      </Row>
      {(transactionStatus.isLoading() || transactionStatus.isFailure()) && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={transactionStatus.isFailure() ? 'Error' : 'Split positions'}
        />
      )}
      {transactionStatus.isSuccess() && (
        <Modal
          isOpen={transactionStatus.isSuccess()}
          onRequestClose={clearComponent}
          subTitle={
            <>
              Positions were successfully split from{' '}
              <span title={conditionIdToPreviewShow}>
                {truncateStringInTheMiddle(conditionIdToPreviewShow, 8, 6)}
              </span>
              .
            </>
          }
          title={'Split Positions'}
        >
          {splitPositionsTable}
        </Modal>
      )}
      <ButtonContainer>
        <Button disabled={!canSubmit} onClick={onSubmit}>
          Split
        </Button>
      </ButtonContainer>
      {isEditPartitionModalOpen && (
        <EditPartitionModal
          isOpen={isEditPartitionModalOpen}
          onRequestClose={() => setIsEditPartitionModalOpen(false)}
          onSave={onEditPartitionSave}
          outcomes={numberedOutcomes}
        />
      )}
      <Prompt
        message={(params) =>
          params.pathname === '/split'
            ? true
            : 'Are you sure you want to leave this page? The changes you made will be lost?'
        }
        when={isDirty}
      />
    </CenteredCard>
  )
}
