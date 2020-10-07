import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { Modal } from 'components/common/Modal'
import { SetAllowance } from 'components/common/SetAllowance'
import { StatusInfoInline, StatusInfoType } from 'components/common/StatusInfoInline'
import { DisplayTablePositions } from 'components/form/DisplayTablePosition'
import { InputAmount } from 'components/form/InputAmount'
import { InputCondition } from 'components/form/InputCondition'
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
import { IconTypes } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from 'config/constants'
import { useConditionContext } from 'contexts/ConditionContext'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { AllowanceMethods, useAllowanceState } from 'hooks/useAllowanceState'
import { SplitFrom } from 'pages/SplitPosition/SplitFrom'
import { GetCondition_condition, GetPosition_position } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { trivialPartition, truncateStringInTheMiddle } from 'util/tools'
import { OutcomeProps, PositionIdsArray, SplitFromType, SplitStatus, Token } from 'util/types'

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
  allowanceMethods: AllowanceMethods
  collateral: Token
  onCollateralChange: (collateral: string) => void
  splitPosition: (
    collateral: string,
    parentCollection: string,
    conditionId: string,
    partition: BigNumber[],
    amount: BigNumber
  ) => void
  tokens: Token[]
}

const logger = getLogger('Form')

export const Form = ({
  allowanceMethods,
  collateral,
  onCollateralChange,
  splitPosition,
  tokens,
}: Props) => {
  const { clearCondition } = useConditionContext()
  const { CTService } = useWeb3ConnectedOrInfura()

  const DEFAULT_VALUES = useMemo(() => {
    return {
      conditionId: '',
      collateral: tokens[0].address,
      amount: ZERO_BN,
      splitFrom: SplitFromType.collateral,
      positionId: '',
    }
  }, [tokens])

  const formMethods = useForm<SplitPositionFormMethods>({
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  })

  const {
    formState: { isValid },
    getValues,
    handleSubmit,
    reset,
    watch,
  } = formMethods

  const [outcomeSlot, setOutcomeSlot] = useState(0)
  const [conditionIdToPreviewShow, setConditionIdToPreviewShow] = useState('')
  const [condition, setCondition] = useState<Maybe<GetCondition_condition>>(null)
  const [position, setPosition] = useState<Maybe<GetPosition_position>>(null)
  const [originalPartition, setOriginalPartition] = useState<BigNumber[]>([])
  const [numberedOutcomes, setNumberedOutcomes] = useState<Array<Array<OutcomeProps>>>([])
  const [isEditPartitionModalOpen, setIsEditPartitionModalOpen] = useState(false)

  const [status, setStatus] = useState<Remote<SplitStatus>>(Remote.notAsked<SplitStatus>())

  const { amount, positionId, splitFrom } = getValues() as SplitPositionFormMethods

  const handleConditionChange = useCallback((condition: Maybe<GetCondition_condition>) => {
    setCondition(condition)
    setOutcomeSlot(condition ? condition.outcomeSlotCount : 0)
    setConditionIdToPreviewShow(condition ? condition.id : '')
  }, [])

  const watchCollateralAddress = watch('collateral')
  watch('splitFrom')
  watch('amount')

  const splitFromCollateral = splitFrom === SplitFromType.collateral
  const splitFromPosition = splitFrom === SplitFromType.position

  useEffect(() => {
    if (watchCollateralAddress) {
      onCollateralChange(getValues('collateral'))
    }
  }, [getValues, onCollateralChange, watchCollateralAddress])

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
    return numberedOutcomes.map((collection: Array<OutcomeProps>) => {
      const collectionExtract = collection.map((item) => item.id).sort((a, b) => +a - +b) //ascending sort
      const indexSet = collectionExtract.reduce((acc, indexSet) => acc | +indexSet, 0)
      return new BigNumber(indexSet)
    })
  }, [numberedOutcomes])

  const onEditPartitionSave = useCallback((numberedOutcomes: Array<Array<OutcomeProps>>) => {
    setIsEditPartitionModalOpen(false)
    setNumberedOutcomes(numberedOutcomes)
  }, [])

  const onSubmit = useCallback(
    async ({ amount, collateral, conditionId }: SplitPositionFormMethods) => {
      try {
        setStatus(Remote.loading())

        let positionIds: PositionIdsArray[]
        let collateralFromSplit: string = collateral
        if (splitFromCollateral) {
          await splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)

          positionIds = await CTService.getPositionsFromPartition(
            partition,
            NULL_PARENT_ID,
            conditionId,
            collateralFromSplit
          )
        } else if (
          splitFromPosition &&
          position &&
          position.collateralToken &&
          position.collection
        ) {
          collateralFromSplit = position.collateralToken.id
          const collectionId = position.collection.id
          await splitPosition(collateralFromSplit, collectionId, conditionId, partition, amount)

          positionIds = await CTService.getPositionsFromPartition(
            partition,
            collectionId,
            conditionId,
            collateralFromSplit
          )
        } else {
          throw Error('Invalid split origin')
        }

        setStatus(Remote.success({ positionIds, collateral: collateralFromSplit }))
      } catch (err) {
        logger.error(err)
        setStatus(Remote.failure(err))
      }
    },
    [CTService, partition, splitFromCollateral, splitFromPosition, position, splitPosition]
  )

  const clearComponent = useCallback(() => {
    reset(DEFAULT_VALUES)
    // Clear condition manually, the reset doesn't work, the use of the conditionContext and react hook form is not so good
    clearCondition()
    // Clear status to notAsked, so we can close the modal
    setStatus(Remote.notAsked<SplitStatus>())
  }, [DEFAULT_VALUES, clearCondition, reset, setStatus])

  const {
    allowanceError,
    allowanceFinished,
    cleanAllowanceError,
    fetchingAllowance,
    shouldDisplayAllowance,
    unlockCollateral,
  } = useAllowanceState(allowanceMethods, amount)

  const isAllowanceVisible = useMemo(() => splitFromCollateral && shouldDisplayAllowance, [
    shouldDisplayAllowance,
    splitFromCollateral,
  ])

  const canSubmit = useMemo(() => {
    if (splitFromCollateral) {
      return isValid && allowanceFinished
    } else {
      return isValid
    }
  }, [splitFromCollateral, isValid, allowanceFinished])

  const outcomesByRow = '14'

  const fullLoadingActionButton = status.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        onClick: () => setStatus(Remote.notAsked<SplitStatus>()),
        text: 'OK',
      }
    : status.isFailure()
    ? {
        buttonType: ButtonType.danger,
        text: 'OK',
        onClick: () => setStatus(Remote.notAsked<SplitStatus>()),
      }
    : undefined

  const fullLoadingIcon = status.isFailure()
    ? IconTypes.error
    : status.isSuccess()
    ? IconTypes.ok
    : IconTypes.spinner

  const fullLoadingMessage = status.isFailure()
    ? status.getFailure()
    : status.isLoading()
    ? 'Working...'
    : undefined

  const splitPositionsTable =
    status.isSuccess() && status.hasData() ? (
      <DisplayTablePositions
        callbackOnHistoryPush={clearComponent}
        collateral={status.get().collateral}
        positionIds={status.get().positionIds}
      />
    ) : null

  return (
    <CenteredCard>
      <Row cols="1fr">
        <InputCondition formMethods={formMethods} onConditionChange={handleConditionChange} />
      </Row>
      {condition && condition.resolved && (
        <Row cols="1fr">
          <StatusInfoInline status={StatusInfoType.warning}>
            This condition is already resolved.
          </StatusInfoInline>
        </Row>
      )}
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Split From"
          value={
            <SplitFrom
              cleanAllowanceError={cleanAllowanceError}
              formMethods={formMethods}
              onPositionChange={setPosition}
              splitFromCollateral={splitFromCollateral}
              splitFromPosition={splitFromPosition}
              tokens={tokens}
            />
          }
        />
      </Row>
      {isAllowanceVisible && (
        <SetAllowance
          collateral={collateral}
          error={allowanceError}
          fetching={fetchingAllowance}
          finished={allowanceFinished}
          onUnlock={unlockCollateral}
        />
      )}
      <Row cols="1fr" marginBottomXL>
        <InputAmount
          collateral={collateral}
          formMethods={formMethods}
          positionId={positionId}
          splitFrom={splitFrom}
        />
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
              <StripedListStyled minHeight="200px">
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
        <PositionPreview
          amount={amount}
          conditionId={conditionIdToPreviewShow}
          partition={partition}
          position={position}
          selectedCollateral={collateral}
          splitFrom={splitFrom}
        />
      </Row>
      {(status.isLoading() || status.isFailure()) && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={status.isFailure() ? 'Error' : 'Split positions'}
        />
      )}
      {status.isSuccess() && (
        <Modal
          isOpen={status.isSuccess()}
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
        <Button disabled={!canSubmit} onClick={handleSubmit(onSubmit)}>
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
    </CenteredCard>
  )
}
