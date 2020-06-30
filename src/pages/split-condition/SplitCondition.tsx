import React, { useState, useEffect } from 'react'
import { BigNumber } from 'ethers/utils'
import { useForm } from 'react-hook-form'
import { Token } from '../../config/networkConfig'
import { SetAllowance } from '../../components/common/SetAllowance'
import { ZERO_BN } from '../../config/constants'
import { trivialPartition } from '../../util/tools'
import { Remote } from '../../util/remoteData'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { InputAmount } from './InputAmount'
import { InputPosition } from './InputPosition'
import { SelectCollateral } from './SelectCollateral'
import { InputCondition } from './InputCondition'
import { fetchPosition_position } from 'types/generatedGQL'
import { ERC20Service } from 'services/erc20'
import { Signer } from 'ethers'
import { JsonRpcProvider } from 'ethers/providers'

export const bytesRegex = /^0x[a-fA-F0-9]{64}$/
export const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'
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
  ctService: ConditionalTokensService
  signer: Signer
  provider: JsonRpcProvider
  address: string
}

export const SplitCondition = ({
  allowance,
  unlockCollateral,
  onCollateralChange,
  hasUnlockedCollateral,
  splitPosition,
  tokens,
  ctService,
  signer,
  provider,
  address,
}: Props) => {
  const formMethods = useForm<SplitPositionForm>({
    mode: 'onChange',
    defaultValues: {
      conditionId: '',
      collateral: tokens[0].address,
      amount: ZERO_BN,
      splitFrom: 'collateral',
      positionId: '',
    },
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
  const [position, setPosition] = useState<Maybe<fetchPosition_position>>(null)
  const {
    amount,
    collateral,
    conditionId,
    splitFrom,
    positionId,
  } = getValues() as SplitPositionForm

  watch('collateral')
  watch('splitFrom')

  const splitFromCollateral = splitFrom === 'collateral'
  const splitFromPosition = splitFrom === 'position'

  const onSubmit = async () => {
    const partition = trivialPartition(outcomeSlot)

    if (splitFromCollateral) {
      splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)
    } else if (splitFromPosition && position) {
      const {
        collection: { id: collectionId },
        collateralToken: { id: collateralAddress },
      } = position
      splitPosition(collateralAddress, collectionId, conditionId, partition, amount)
    } else {
      throw Error('Invalid split origin')
    }

    reset({
      amount: ZERO_BN,
      collateral: tokens[0].address,
      conditionId: '',
      splitFrom: 'collateral',
      positionId: '',
    })
  }

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
      <InputCondition
        ctService={ctService}
        formMethods={formMethods}
        onOutcomeSlotChange={(n) => setOutcomeSlot(n)}
      ></InputCondition>
      <SelectCollateral
        formMethods={formMethods}
        splitFromCollateral={splitFromCollateral}
        onCollateralChange={onCollateralChange}
        tokens={tokens}
      ></SelectCollateral>
      <InputPosition
        onPositionChange={(p) => setPosition(p)}
        splitFromPosition={splitFromPosition}
        formMethods={formMethods}
      ></InputPosition>
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
        ctService={ctService}
        address={address}
        signer={signer}
        provider={provider}
        formMethods={formMethods}
      ></InputAmount>
      <button onClick={handleSubmit(onSubmit)} disabled={!canSubmit}>
        Split
      </button>
    </div>
  )
}
