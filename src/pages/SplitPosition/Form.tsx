import { useWeb3Connected } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ERC20Service } from 'services/erc20'
import { GetPosition_position } from 'types/generatedGQL'

import { Button } from '../../components/buttons/Button'
import { CenteredCard } from '../../components/common/CenteredCard'
import { SetAllowance } from '../../components/common/SetAllowance'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { Row } from '../../components/pureStyledComponents/Row'
import { TitleValue } from '../../components/text/TitleValue'
import { NULL_PARENT_ID, ZERO_BN } from '../../config/constants'
import { Remote } from '../../util/remoteData'
import { trivialPartition } from '../../util/tools'
import { Token } from '../../util/types'

import { InputAmount } from './InputAmount'
import { InputCondition } from './InputCondition'
import { InputPosition } from './InputPosition'
import { SelectCollateral } from './SelectCollateral'

export type SplitFrom = 'collateral' | 'position'

export type SplitPositionForm = {
  amount: BigNumber
  collateral: string
  conditionId: string
  positionId: string
  splitFrom: SplitFrom
}

interface Props {
  allowance: Remote<BigNumber>
  unlockCollateral: () => void
  onCollateralChange: (collateral: string) => void
  splitPosition: (
    collateral: string,
    parentCollection: string,
    conditionId: string,
    partition: BigNumber[],
    amount: BigNumber
  ) => void
  hasUnlockedCollateral: boolean
  tokens: Token[]
}

export const Form = ({
  allowance,
  hasUnlockedCollateral,
  onCollateralChange,
  splitPosition,
  tokens,
  unlockCollateral,
}: Props) => {
  const DEFAULT_VALUES = useMemo(() => {
    return {
      conditionId: '',
      collateral: tokens[0].address,
      amount: ZERO_BN,
      splitFrom: 'collateral' as SplitFrom,
      positionId: '',
    }
  }, [tokens])

  const formMethods = useForm<SplitPositionForm>({
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
  const { amount, collateral, positionId, splitFrom } = getValues() as SplitPositionForm

  watch('collateral')
  watch('splitFrom')

  const splitFromCollateral = splitFrom === 'collateral'
  const splitFromPosition = splitFrom === 'position'

  const onSubmit = useCallback(
    async ({ amount, collateral, conditionId }: SplitPositionForm) => {
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

  const hasEnoughAllowance = allowance.map(
    (allowance) => allowance.gte(amount) && !allowance.isZero()
  )

  // We show the allowance component if we know the user doesn't have enough allowance
  const showAskAllowance =
    (hasEnoughAllowance.hasData() && !hasEnoughAllowance.get()) ||
    hasUnlockedCollateral ||
    allowance.isLoading()

  const canSubmit = isValid && (hasEnoughAllowance.getOr(false) || hasUnlockedCollateral)

  return (
    <CenteredCard>
      <Row cols="1fr">
        <TitleValue
          title="Condition Id"
          value={
            <InputCondition
              formMethods={formMethods}
              onOutcomeSlotChange={(n) => setOutcomeSlot(n)}
            />
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Split From"
          value={
            <>
              <SelectCollateral
                formMethods={formMethods}
                onCollateralChange={onCollateralChange}
                splitFromCollateral={splitFromCollateral}
                tokens={tokens}
              />
              <InputPosition
                formMethods={formMethods}
                onPositionChange={(p) => setPosition(p)}
                splitFromPosition={splitFromPosition}
              ></InputPosition>
            </>
          }
        />
      </Row>
      {showAskAllowance && (
        <SetAllowance
          collateral={collateralToken}
          finished={hasUnlockedCollateral && hasEnoughAllowance.getOr(false)}
          loading={allowance.isLoading()}
          onUnlock={unlockCollateral}
        />
      )}
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Amount"
          value={
            <InputAmount
              collateral={collateralToken}
              formMethods={formMethods}
              positionId={positionId}
              splitFrom={splitFrom}
            ></InputAmount>
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
