import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BigNumber } from 'ethers/utils'
import { useForm } from 'react-hook-form'

import { Token } from '../../util/types'
import { SetAllowance } from '../../components/common/SetAllowance'
import { ZERO_BN, NULL_PARENT_ID } from '../../config/constants'
import { trivialPartition } from '../../util/tools'
import { Remote } from '../../util/remoteData'
import { InputAmount } from './InputAmount'
import { InputPosition } from './InputPosition'
import { SelectCollateral } from './SelectCollateral'
import { InputCondition } from './InputCondition'
import { GetPosition_position } from 'types/generatedGQL'
import { ERC20Service } from 'services/erc20'
import { useWeb3Connected } from 'contexts/Web3Context'

export type SplitFrom = 'collateral' | 'position'

export type SplitPositionForm = {
  conditionId: string
  collateral: string
  amount: BigNumber
  splitFrom: SplitFrom
  positionId: string
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

export const SplitCondition = ({
  allowance,
  unlockCollateral,
  onCollateralChange,
  hasUnlockedCollateral,
  splitPosition,
  tokens,
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
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { isValid },
  } = formMethods

  const [outcomeSlot, setOutcomeSlot] = useState(0)
  const [collateralToken, setCollateralToken] = useState(tokens[0])
  const [position, setPosition] = useState<Maybe<GetPosition_position>>(null)
  const { signer, provider } = useWeb3Connected()
  const { amount, collateral, splitFrom, positionId } = getValues() as SplitPositionForm

  watch('collateral')
  watch('splitFrom')

  const splitFromCollateral = splitFrom === 'collateral'
  const splitFromPosition = splitFrom === 'position'

  const onSubmit = useCallback(
    async ({ collateral, conditionId, amount }: SplitPositionForm) => {
      const partition = trivialPartition(outcomeSlot)

      if (splitFromCollateral) {
        splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)
      } else if (splitFromPosition && position) {
        const {
          collection: { id: collectionId },
          collateralToken: { id: collateral },
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
    <div>
      <InputCondition formMethods={formMethods} onOutcomeSlotChange={(n) => setOutcomeSlot(n)} />
      <SelectCollateral
        formMethods={formMethods}
        splitFromCollateral={splitFromCollateral}
        onCollateralChange={onCollateralChange}
        tokens={tokens}
      />
      <InputPosition
        onPositionChange={(p) => setPosition(p)}
        splitFromPosition={splitFromPosition}
        formMethods={formMethods}
      />
      {showAskAllowance && (
        <SetAllowance
          collateral={collateralToken}
          loading={allowance.isLoading()}
          finished={hasUnlockedCollateral && hasEnoughAllowance.getOr(false)}
          onUnlock={unlockCollateral}
        />
      )}

      <InputAmount
        collateral={collateralToken}
        positionId={positionId}
        splitFrom={splitFrom}
        formMethods={formMethods}
      />
      <button onClick={handleSubmit(onSubmit)} disabled={!canSubmit}>
        Split
      </button>
    </div>
  )
}
