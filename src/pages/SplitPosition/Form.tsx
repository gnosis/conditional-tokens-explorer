import { useWeb3Connected } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import { AllowanceMethods, useAllowanceState } from 'hooks/useAllowanceState'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ERC20Service } from 'services/erc20'
import styled from 'styled-components'
import { GetPosition_position } from 'types/generatedGQL'

import { Button } from '../../components/buttons/Button'
import { CenteredCard } from '../../components/common/CenteredCard'
import { SetAllowance } from '../../components/common/SetAllowance'
import { StripedList, StripedListItem } from '../../components/common/StripedList'
import { InputAmount } from '../../components/form/InputAmount'
import { InputCondition } from '../../components/form/InputCondition'
import { Partition } from '../../components/partitions/Partition'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { Row } from '../../components/pureStyledComponents/Row'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'
import { TitleValue } from '../../components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from '../../config/constants'
import { trivialPartition } from '../../util/tools'
import { Token } from '../../util/types'

import { SplitFrom } from './SplitFrom'

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

const PartitionStyled = styled(Partition)`
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

export const Form = ({ allowanceMethods, onCollateralChange, splitPosition, tokens }: Props) => {
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
  const [collateralToken, setCollateralToken] = useState(tokens[0])
  const [position, setPosition] = useState<Maybe<GetPosition_position>>(null)
  const { provider, signer } = useWeb3Connected()
  const { amount, collateral, positionId, splitFrom } = getValues() as SplitPositionFormMethods

  watch('collateral')
  watch('splitFrom')

  const splitFromCollateral = splitFrom === 'collateral'
  const splitFromPosition = splitFrom === 'position'

  const onSubmit = useCallback(
    async ({ amount, collateral, conditionId }: SplitPositionFormMethods) => {
      const partition = trivialPartition(outcomeSlot)

      if (splitFromCollateral) {
        splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)
      } else if (splitFromPosition && position) {
        const {
          collateralToken: { id: collateral },
          collection: { id: collectionId },
        } = position
        splitPosition(collateral, collectionId, conditionId, partition, amount)
      } else {
        throw Error('Invalid split origin')
      }

      reset(DEFAULT_VALUES)
    },
    [
      position,
      outcomeSlot,
      reset,
      splitFromCollateral,
      splitFromPosition,
      splitPosition,
      DEFAULT_VALUES,
    ]
  )

  useEffect(() => {
    let isSubscribed = true

    const fetchToken = async (collateral: string) => {
      const erc20Service = new ERC20Service(provider, signer, collateral)
      const token = await erc20Service.getProfileSummary()
      if (isSubscribed) {
        setCollateralToken(token)
      }
    }

    if (splitFromCollateral) {
      const collateralToken = tokens.find((t) => t.address === collateral) || tokens[0]
      setCollateralToken(collateralToken)
    } else if (splitFromPosition) {
      fetchToken(collateral)
    }

    return () => {
      isSubscribed = false
    }
  }, [
    splitFromPosition,
    onCollateralChange,
    tokens,
    collateral,
    splitFromCollateral,
    provider,
    signer,
  ])

  const { allowanceFinished, fetching, showAskAllowance, unlockCollateral } = useAllowanceState(
    allowanceMethods,
    amount
  )

  const canSubmit = isValid && allowanceFinished
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
        <InputCondition formMethods={formMethods} onOutcomeSlotChange={(n) => setOutcomeSlot(n)} />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Split From"
          value={
            <SplitFrom
              formMethods={formMethods}
              onCollateralChange={onCollateralChange}
              onPositionChange={(p) => setPosition(p)}
              splitFromCollateral={splitFromCollateral}
              splitFromPosition={splitFromPosition}
              tokens={tokens}
            />
          }
        />
      </Row>
      {showAskAllowance && (
        <SetAllowance
          collateral={collateralToken}
          fetching={fetching}
          finished={allowanceFinished}
          onUnlock={unlockCollateral}
        />
      )}
      <Row cols="1fr" marginBottomXL>
        <InputAmount
          collateral={collateralToken}
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
        <TitleValue
          title="Split Position Preview"
          value={
            <StripedListStyled>
              <StripedListItem>[DAI C: 0x123 O: 0] x 10</StripedListItem>
              <StripedListItem>[DAI C: 0x123 O: 1] x 10</StripedListItem>
            </StripedListStyled>
          }
        />
      </Row>
      <ButtonContainer>
        <Button disabled={!canSubmit} onClick={handleSubmit(onSubmit)}>
          Split
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
