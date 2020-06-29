import React, { useState, useEffect } from 'react'
import { BigNumber } from 'ethers/utils'
import { useForm, Controller } from 'react-hook-form'
import { Token } from '../../config/networkConfig'
import { SetAllowance } from '../../components/common/SetAllowance'
import { BigNumberInputWrapper } from '../../components/common/BigNumberInputWrapper'
import { ZERO_BN } from '../../config/constants'
import { range } from '../../util/tools'
import { Remote } from '../../util/remoteData'
import { ConditionalTokensService } from '../../services/conditionalTokens'

const bytesRegex = /^0x[a-fA-F0-9]{64}$/
const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'

type Form = {
  conditionId: string
  collateral: string
  amount: BigNumber
}

interface Props {
  allowance: Remote<BigNumber>
  unlockCollateral: () => void
  onCollateralChange: (collateral: Token) => void
  hasUnlockedCollateral: boolean
  tokens: Token[]
  ctService: ConditionalTokensService
}

export const SplitCondition = ({
  allowance,
  unlockCollateral,
  onCollateralChange,
  hasUnlockedCollateral,
  tokens,
  ctService,
}: Props) => {
  const {
    register,
    errors,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    getValues,
    formState: { isValid },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: { conditionId: '', collateral: tokens[0].address, amount: ZERO_BN },
  })

  const [outcomeSlot, setOutcomeSlot] = useState(0)
  const [collateralToken, setCollateralToken] = useState(tokens[0])
  const { amount, collateral, conditionId } = getValues() as Form

  const watchCollateral = watch('collateral')
  useEffect(() => {
    const collateralToken = tokens.find((t) => t.address === collateral) || tokens[0]
    setCollateralToken(collateralToken)
    onCollateralChange(collateralToken)
  }, [watchCollateral, onCollateralChange, tokens, collateral])

  const onSubmit = async () => {
    const partition = range(outcomeSlot).reduce((acc: BigNumber[], _, index: number) => {
      const two = new BigNumber(2)
      acc.push(two.pow(index))
      return acc
    }, [])

    await ctService.splitPosition(collateral, NULL_PARENT_ID, conditionId, partition, amount)
    reset({ amount: ZERO_BN, collateral: tokens[0].address, conditionId: '' })
  }

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      const outcomeSlot = await ctService.getOutcomeSlotCount(conditionId)
      setOutcomeSlot(outcomeSlot.toNumber())
    }
    if (conditionId && !errors.conditionId) {
      getOutcomeSlot(conditionId)
    }
  }, [ctService, conditionId, errors.conditionId])

  useEffect(() => {
    setValue('amount', ZERO_BN)
  }, [collateral, setValue])

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="conditionId">Condition Id</label>
      {/* Select Condition */}
      <input
        name="conditionId"
        type="text"
        ref={register({
          required: true,
          pattern: bytesRegex,
          validate: async (value) => {
            const conditionExist = await ctService.conditionExists(value)
            return conditionExist
          },
        })}
      ></input>
      {errors.conditionId && (
        <div>
          <p>{errors.conditionId.type === 'pattern' && 'Invalid bytes32 string'}</p>
          <p>{errors.conditionId.type === 'validate' && 'Invalid condition'}</p>
        </div>
      )}

      <label htmlFor="collateral">Collateral</label>
      <select ref={register({ required: true })} name="collateral">
        {tokens.map(({ symbol, address }) => {
          return (
            <option key={address} value={address}>
              {symbol}
            </option>
          )
        })}
      </select>

      {showAskAllowance && (
        <SetAllowance
          collateral={collateralToken}
          loading={allowance.isLoading()}
          finished={hasUnlockedCollateral && hasEnoughAllowance.getOr(false)}
          onUnlock={unlockCollateral}
        />
      )}

      <label htmlFor="amount">Amount</label>
      <Controller
        name="amount"
        rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
        control={control}
        decimals={collateralToken.decimals}
        as={BigNumberInputWrapper}
      />

      <button type="submit" disabled={!canSubmit}>
        Split
      </button>
    </form>
  )
}
