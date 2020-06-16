import React, { useState, useEffect, useCallback } from 'react'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { RouteComponentProps } from 'react-router'
import { BigNumber } from 'ethers/utils'
import { useForm, Controller } from 'react-hook-form'
import { Token } from '../../config/networkConfig'
import { useAllowance } from '../../hooks/useAllowance'
import { SetAllowance } from '../../components/common/SetAllowance'
import { BigNumberInputWrapper } from '../../components/common/BigNumberInputWrapper'
import { ZERO_BN } from '../../config/constants'
import { range } from '../../util/tools'
import { Remote } from '../../util/remoteData'
import { constants } from 'ethers'

interface RouteParams {
  condition: string
}

interface Form {
  conditionId: Maybe<string>
  collateral: Maybe<Token>
  amount: BigNumber
}

const bytesRegex = /^0x[a-fA-F0-9]{64}$/
const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const SplitCondition = (props: RouteComponentProps<RouteParams>) => {
  const {
    register,
    errors,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    getValues,
    formState: { isValid },
  } = useForm<Form>({ mode: 'onChange' })

  const { CTService, networkConfig, provider } = useWeb3Connected()
  const tokens = networkConfig.getTokens()

  const [collateral, setCollateral] = useState<Token>(tokens[0])

  const { refresh, unlock } = useAllowance(collateral)
  const [allowance, setAllowance] = useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())

  const defaultConditionId = props.match.params.condition || ''
  const [outcomeSlot, setOutcomeSlot] = useState(0)
  const [hasUnlockedCollateral, setHasUnlockedCollateral] = useState(false)

  const values = getValues() as { amount?: BigNumber; conditionId: string }
  const amount = values.amount || ZERO_BN
  const conditionId = values.conditionId

  const onSubmit = async () => {
    const partition = range(outcomeSlot).reduce((acc: BigNumber[], _, index: number) => {
      const two = new BigNumber(2)
      acc.push(two.pow(index))
      return acc
    }, [])

    await CTService.splitPosition(
      collateral.address,
      conditionId,
      NULL_PARENT_ID,
      partition,
      amount
    )
    reset({ amount: ZERO_BN, collateral: tokens[0], conditionId: '' })
  }

  const unlockCollateral = async () => {
    setAllowance(Remote.loading())
    const { transactionHash } = await unlock()
    if (transactionHash) {
      await provider.waitForTransaction(transactionHash)
      setHasUnlockedCollateral(true)
      setAllowance(Remote.success(constants.MaxUint256))
    }
  }

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      try {
        const outcomeSlot = await CTService.getOutcomeSlotCount(conditionId)
        setOutcomeSlot(outcomeSlot.toNumber())
        if (outcomeSlot.isZero()) {
          setError('conditionId', 'validate', "Condition doesn't exists")
        }
      } catch ({ reason }) {
        setError('conditionId', 'validate', reason)
      }
    }
    if (conditionId && !errors.conditionId) {
      getOutcomeSlot(conditionId)
    }
  }, [CTService, conditionId, errors.conditionId, setError])

  const fetchAllowance = useCallback(async () => {
    try {
      const allowance = await refresh()
      setAllowance(Remote.success(allowance))
    } catch (e) {
      setAllowance(Remote.failure(e))
    }
  }, [refresh])

  useEffect(() => {
    fetchAllowance()
  }, [fetchAllowance])

  useEffect(() => {
    setValue('amount', ZERO_BN)
    setHasUnlockedCollateral(false)
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
        defaultValue={defaultConditionId}
        onChange={(e) => setValue('conditionId', e.target.value)}
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
      <select
        ref={register({ required: true })}
        name="collateral"
        onChange={(e) =>
          setCollateral(tokens.find((t) => t.address === e.target.value) || tokens[0])
        }
      >
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
          collateral={collateral}
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
        decimals={collateral.decimals}
        as={BigNumberInputWrapper}
      />

      <button type="submit" disabled={!canSubmit}>
        Split
      </button>
    </form>
  )
}
