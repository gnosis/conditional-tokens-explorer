import { positionString } from 'util/tools'

import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'

import { Button } from '../../components/buttons/Button'
import { CenteredCard } from '../../components/common/CenteredCard'
import { SetAllowance } from '../../components/common/SetAllowance'
import { InputAmount } from '../../components/form/InputAmount'
import { InputCondition } from '../../components/form/InputCondition'
import { EditPartitionModal } from '../../components/modals/EditPartitionModal'
import { Outcome } from '../../components/partitions/Outcome'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { CardTextSm } from '../../components/pureStyledComponents/CardText'
import { ErrorContainer, Error as ErrorMessage } from '../../components/pureStyledComponents/Error'
import { OutcomesContainer } from '../../components/pureStyledComponents/OutcomesContainer'
import { Row } from '../../components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
  StripedListItemLessPadding,
} from '../../components/pureStyledComponents/StripedList'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'
import { FullLoading } from '../../components/statusInfo/FullLoading'
import { IconTypes } from '../../components/statusInfo/common'
import { TitleValue } from '../../components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from '../../config/constants'
import { useConditionContext } from '../../contexts/ConditionContext'
import { AllowanceMethods, useAllowanceState } from '../../hooks/useAllowanceState'
import { GetCondition_condition, GetPosition_position } from '../../types/generatedGQL'
import { getLogger } from '../../util/logger'
import { trivialPartition } from '../../util/tools'
import { OutcomeProps, Token } from '../../util/types'

import { SplitFrom } from './SplitFrom'

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

export type SplitFrom = 'collateral' | 'position'

export type SplitPositionFormMethods = {
  amount: BigNumber
  collateral: string
  conditionId: string
  positionId: string
  splitFrom: SplitFrom
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

  const DEFAULT_VALUES = useMemo(() => {
    return {
      conditionId: '',
      collateral: tokens[0].address,
      amount: ZERO_BN,
      splitFrom: 'collateral' as SplitFrom,
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
  const [isTransactionExecuting, setIsTransactionExecuting] = useState(false)
  const [error, setError] = useState<Maybe<Error>>(null)

  const { amount, positionId, splitFrom } = getValues() as SplitPositionFormMethods

  const handleConditionChange = useCallback((condition: Maybe<GetCondition_condition>) => {
    setOutcomeSlot(condition ? condition.outcomeSlotCount : 0)
    setConditionIdToPreviewShow(condition ? condition.id : '')
  }, [])

  const watchCollateralAddress = watch('collateral')
  watch('splitFrom')
  watch('amount')

  const splitFromCollateral = splitFrom === 'collateral'
  const splitFromPosition = splitFrom === 'position'

  useEffect(() => {
    if (watchCollateralAddress) {
      onCollateralChange(getValues('collateral'))
    }
  }, [getValues, onCollateralChange, watchCollateralAddress])

  const onSubmit = useCallback(
    async ({ amount, collateral, conditionId }: SplitPositionFormMethods) => {
      try {
        setIsTransactionExecuting(true)
        const partition = trivialPartition(outcomeSlot)

        if (splitFromCollateral) {
          await splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)
        } else if (splitFromPosition && position) {
          const {
            collateralToken: { id: collateral },
            collection: { id: collectionId },
          } = position
          await splitPosition(collateral, collectionId, conditionId, partition, amount)
        } else {
          throw Error('Invalid split origin')
        }
      } catch (err) {
        logger.error(err)
        setError(err)
      } finally {
        setIsTransactionExecuting(false)
        reset(DEFAULT_VALUES)
        // Clear condition manually, the reset doesn't work, the use of the conditionContext and react hook form is not so good
        clearCondition()
      }
    },
    [
      outcomeSlot,
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

  const canSubmit = isValid && allowanceFinished
  const mockedNumberedOutcomes = [
    [
      { value: 1, id: '0x1234567' },
      { value: 4, id: '0x2345678' },
      { value: 3, id: '0x3456789' },
    ],
    [
      { value: 2, id: '0x4567890' },
      { value: 5, id: '0x5678901' },
    ],
    [
      { value: 10, id: '0x6789012' },
      { value: 11, id: '0x7890123' },
    ],
    [
      { value: 6, id: '0x8901234' },
      { value: 8, id: '0x9012345' },
      { value: 9, id: '0x0123456' },
    ],
    [{ value: 7, id: '0x6543210' }],
    [
      { value: 12, id: '0x1234567' },
      { value: 13, id: '0x2345678' },
      { value: 14, id: '0x3456789' },
      { value: 15, id: '0x1234567' },
      { value: 16, id: '0x2345678' },
      { value: 17, id: '0x3456789' },
      { value: 18, id: '0x1234567' },
      { value: 19, id: '0x2345678' },
      { value: 20, id: '0x3456789' },
      { value: 21, id: '0x1234567' },
      { value: 22, id: '0x2345678' },
      { value: 23, id: '0x3456789' },
      { value: 24, id: '0x1234567' },
      { value: 25, id: '0x2345678' },
      { value: 26, id: '0x3456789' },
      { value: 27, id: '0x1234567' },
      { value: 28, id: '0x2345678' },
      { value: 29, id: '0x3456789' },
    ],
  ]

  const [isEditPartitionModalOpen, setIsEditPartitionModalOpen] = useState(false)
  const outcomesByRow = '15'
  const splitPositionPreview = useMemo(() => {
    if (!conditionIdToPreviewShow || (splitFromPosition && !position)) {
      return []
    }

    if (splitFromPosition && position) {
      return trivialPartition(outcomeSlot).map((indexSet) => {
        return positionString(
          [...position.conditionIds, conditionIdToPreviewShow],
          [...[position.indexSets], indexSet],
          amount,
          collateral
        )
      })
    } else {
      return trivialPartition(outcomeSlot).map((indexSet) => {
        return positionString([conditionIdToPreviewShow], [indexSet], amount, collateral)
      })
    }
  }, [conditionIdToPreviewShow, position, outcomeSlot, amount, collateral, splitFromPosition])

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
              onPositionChange={(p) => setPosition(p)}
              splitFromCollateral={splitFromCollateral}
              splitFromPosition={splitFromPosition}
              tokens={tokens}
            />
          }
        />
      </Row>
      {shouldDisplayAllowance && (
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
            <TitleControl onClick={() => setIsEditPartitionModalOpen(true)}>
              Edit Partition
            </TitleControl>
          }
          value={
            <>
              <CardTextSm>Outcomes Collections</CardTextSm>
              <StripedListStyled minHeight="200px">
                {/* DELETE THESE COMMENTS WHEN THIS IS DONE */}
                {/* Note: As I understand it, outcomes come from the selected condition,
                so you can't show anything until you selected a condition. */}
                {conditionIdToPreviewShow && mockedNumberedOutcomes.length ? (
                  mockedNumberedOutcomes.map(
                    (outcomeList: unknown | any, outcomeListIndex: number) => {
                      return (
                        <StripedListItemLessPadding key={outcomeListIndex}>
                          <OutcomesContainer columnGap="0" columns={outcomesByRow}>
                            {outcomeList.map((outcome: OutcomeProps, outcomeIndex: number) => (
                              <Outcome
                                key={outcomeIndex}
                                lastInRow={outcomesByRow}
                                outcome={outcome.value}
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
        <TitleValue
          title="Split Position Preview"
          value={
            <StripedListStyled>
              {splitPositionPreview.length ? (
                splitPositionPreview.map((preview, i) => (
                  <StripedListItem key={`preview-${i}`}>{preview}</StripedListItem>
                ))
              ) : (
                <StripedListEmpty>No Preview.</StripedListEmpty>
              )}
            </StripedListStyled>
          }
        />
      </Row>
      {isTransactionExecuting && (
        <FullLoading
          actionButton={
            error ? { text: 'OK', onClick: () => setIsTransactionExecuting(true) } : undefined
          }
          icon={error ? IconTypes.error : IconTypes.spinner}
          message={error ? error.message : 'Waiting...'}
          title={error ? 'Error' : 'Split position'}
        />
      )}
      {error && (
        <ErrorContainer>
          <ErrorMessage>{error.message}</ErrorMessage>
        </ErrorContainer>
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
          outcomes={mockedNumberedOutcomes}
        />
      )}
    </CenteredCard>
  )
}
