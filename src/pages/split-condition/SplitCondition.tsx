import React, { useState, useEffect, useCallback } from 'react'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import { useForm, Controller } from 'react-hook-form'
import { Token } from '../../config/networkConfig'
import { SetAllowance } from '../../components/common/SetAllowance'
import { BigNumberInputWrapper } from '../../components/common/BigNumberInputWrapper'
import { ZERO_BN } from '../../config/constants'
import { range } from '../../util/tools'
import { Remote } from '../../util/remoteData'

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
  onCollateralChange: (collateral: string) => void
  hasUnlockedCollateral: boolean
}

export const SplitCondition = ({
  allowance,
  unlockCollateral,
  onCollateralChange,
  hasUnlockedCollateral,
}: Props) => {
  const { CTService, networkConfig } = useWeb3Connected()
  const tokens = networkConfig.getTokens()

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

  const { amount, collateral, conditionId } = getValues() as Form
  let token = tokens[0]

  const watchCollateral = watch('collateral')
  useEffect(() => {
    token = tokens.find((t) => t.address === collateral) || tokens[0]
    console.log(token.symbol)
    onCollateralChange(collateral)
  }, [watchCollateral])

  const onSubmit = async () => {
    const partition = range(outcomeSlot).reduce((acc: BigNumber[], _, index: number) => {
      const two = new BigNumber(2)
      acc.push(two.pow(index))
      return acc
    }, [])

    await CTService.splitPosition(collateral, conditionId, NULL_PARENT_ID, partition, amount)
    reset({ amount: ZERO_BN, collateral: tokens[0].address, conditionId: '' })
  }

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      const outcomeSlot = await CTService.getOutcomeSlotCount(conditionId)
      setOutcomeSlot(outcomeSlot.toNumber())
    }
    if (conditionId && !errors.conditionId) {
      getOutcomeSlot(conditionId)
    }
  }, [CTService, conditionId, errors.conditionId])

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
            const conditionExist = await CTService.conditionExists(value)
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
          collateral={token}
          loading={allowance.isLoading()}
          finished={hasUnlockedCollateral}
          onUnlock={unlockCollateral}
        />
      )}

      <label htmlFor="amount">Amount</label>
      <Controller
        name="amount"
        rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
        control={control}
        decimals={token.decimals}
        as={BigNumberInputWrapper}
      />

      <button type="submit" disabled={!canSubmit}>
        Split
      </button>
    </form>
  )
}
