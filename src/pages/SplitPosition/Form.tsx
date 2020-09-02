import { PositionPreview } from 'components/splitPosition/PositionPreview'
import { BigNumber } from 'ethers/utils'
import { AllowanceMethods, useAllowanceState } from 'hooks/useAllowanceState'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { GetCondition_condition, GetPosition_position } from 'types/generatedGQL'

import { Button } from '../../components/buttons/Button'
import { CenteredCard } from '../../components/common/CenteredCard'
import { SetAllowance } from '../../components/common/SetAllowance'
import { InputAmount } from '../../components/form/InputAmount'
import { InputCondition } from '../../components/form/InputCondition'
import { Partition } from '../../components/partitions/Partition'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { ErrorContainer, Error as ErrorMessage } from '../../components/pureStyledComponents/Error'
import { Row } from '../../components/pureStyledComponents/Row'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'
import { FullLoading } from '../../components/statusInfo/FullLoading'
import { IconTypes } from '../../components/statusInfo/common'
import { TitleValue } from '../../components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from '../../config/constants'
import { useConditionContext } from '../../contexts/ConditionContext'
import { getLogger } from '../../util/logger'
import { trivialPartition } from '../../util/tools'
import { SplitFromType, Token } from '../../util/types'

import { SplitFrom } from './SplitFrom'

const PartitionStyled = styled(Partition)`
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

  const splitFromCollateral = splitFrom === SplitFromType.collateral
  const splitFromPosition = splitFrom === SplitFromType.position

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

  const mockedNumberedOutcomes = [
    [1, 4, 3],
    [6, 5],
    [9, 7, 10],
    [2, 8],
    [12, 13, 14, 15],
  ]

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
          titleControl={<TitleControl>Edit Partition</TitleControl>}
          value={<PartitionStyled collections={mockedNumberedOutcomes} />}
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <PositionPreview
          amount={amount}
          conditionId={conditionIdToPreviewShow}
          outcomeSlotCount={outcomeSlot}
          position={position}
          selectedCollateral={collateral}
          splitFrom={splitFrom}
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
    </CenteredCard>
  )
}
