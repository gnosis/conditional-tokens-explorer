import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { CenteredCard } from 'components/common/CenteredCard'
import { SetAllowance } from 'components/common/SetAllowance'
import { InputAmount } from 'components/form/InputAmount'
import { InputCondition } from 'components/form/InputCondition'
import { EditPartitionModal } from 'components/modals/EditPartitionModal'
import { Outcome } from 'components/partitions/Outcome'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { CardTextSm } from 'components/pureStyledComponents/CardText'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
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
import { CellHash } from 'components/table/CellHash'
import { TitleValue } from 'components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from 'config/constants'
import { useConditionContext } from 'contexts/ConditionContext'
import { AllowanceMethods, useAllowanceState } from 'hooks/useAllowanceState'
import { SplitFrom } from 'pages/SplitPosition/SplitFrom'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { customStyles } from 'theme/tableCustomStyles'
import { GetCondition_condition, GetPosition_position } from 'types/generatedGQL'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { trivialPartition } from 'util/tools'
import { OutcomeProps, PositionIdsArray, SplitFromType, Token } from 'util/types'

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

const DisplayTablePositions = ({ data }: { data: PositionIdsArray[] }) => {
  const history = useHistory()

  const handleRowClick = useCallback(
    (positionId: string) => {
      history.push(`/positions/${positionId}`)
    },
    [history]
  )

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionIdsArray) => {
          return (
            <CellHash
              onClick={() => {
                handleRowClick(row.positionId)
              }}
              underline
              value={row.positionId}
            />
          )
        },
        maxWidth: '370px',
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
    ]
  }, [handleRowClick])

  return (
    <DataTable
      className="outerTableWrapper inlineTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={data || []}
      noDataComponent={<EmptyContentText>{`No positions found.`}</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
    />
  )
}

export const Form = ({
  allowanceMethods,
  collateral,
  onCollateralChange,
  splitPosition,
  tokens,
}: Props) => {
  const { clearCondition } = useConditionContext()

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
  const [position, setPosition] = useState<Maybe<GetPosition_position>>(null)
  const [originalPartition, setOriginalPartition] = useState<BigNumber[]>([])
  const [numberedOutcomes, setNumberedOutcomes] = useState<Array<Array<OutcomeProps>>>([])
  const [isEditPartitionModalOpen, setIsEditPartitionModalOpen] = useState(false)

  const [status, setStatus] = useState<Remote<PositionIdsArray[]>>(
    Remote.notAsked<PositionIdsArray[]>()
  )

  const { amount, positionId, splitFrom } = getValues() as SplitPositionFormMethods

  const handleConditionChange = useCallback((condition: Maybe<GetCondition_condition>) => {
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

        let positions: PositionIdsArray[]
        if (splitFromCollateral) {
          await splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)

          positions = ConditionalTokensService.getPositionsFromPartition(
            partition,
            NULL_PARENT_ID,
            conditionId,
            collateral
          )
        } else if (splitFromPosition && position) {
          const {
            collateralToken: { id: collateral },
            collection: { id: collectionId },
          } = position

          await splitPosition(collateral, collectionId, conditionId, partition, amount)

          positions = ConditionalTokensService.getPositionsFromPartition(
            partition,
            collectionId,
            conditionId,
            collateral
          )
        } else {
          throw Error('Invalid split origin')
        }

        setStatus(Remote.success(positions))
      } catch (err) {
        logger.error(err)
        setStatus(Remote.failure(err))
      } finally {
        reset(DEFAULT_VALUES)
        // Clear condition manually, the reset doesn't work, the use of the conditionContext and react hook form is not so good
        clearCondition()
      }
    },
    [
      partition,
      splitFromCollateral,
      splitFromPosition,
      position,
      splitPosition,
      reset,
      DEFAULT_VALUES,
      clearCondition,
    ]
  )

  const {
    allowanceFinished,
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

  const outcomesByRow = '15'

  const fullLoadingActionButton =
    status.isSuccess() || status.isFailure()
      ? { text: 'OK', onClick: () => setStatus(Remote.notAsked<PositionIdsArray[]>()) }
      : undefined

  const fullLoadingIcon = status.isFailure()
    ? IconTypes.error
    : status.isSuccess()
    ? IconTypes.ok
    : IconTypes.spinner

  const fullLoadingMessage = status.isFailure()
    ? status.getFailure()
    : status.isLoading()
    ? 'Waiting...'
    : undefined

  const fullLoadingBody =
    status.isSuccess() && status.hasData() ? (
      <DisplayTablePositions data={status.get() || []} />
    ) : undefined

  return (
    <CenteredCard>
      <Row cols="1fr">
        <InputCondition formMethods={formMethods} onConditionChange={handleConditionChange} />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Split From"
          value={
            <SplitFrom
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
      {(status.isLoading() || status.isSuccess() || status.isFailure()) && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          bodyComponent={fullLoadingBody}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={status.isFailure() ? 'Error' : 'Split positions'}
          width={status.isFailure() ? '550px' : status.isSuccess() ? '460px' : undefined}
        />
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
