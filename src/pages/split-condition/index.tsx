import React, { useState, useEffect } from 'react'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { RouteComponentProps } from 'react-router'
import { BigNumber } from 'ethers/utils'
import { useForm, Controller } from 'react-hook-form'
import { Token } from '../../config/networkConfig'
import { useAllowance } from '../../hooks/useAllowance'
import { SetAllowance } from '../../components/common/SetAllowance'
import { BigNumberInputWrapper } from '../../components/common/BigNumberInputWrapper'
import { ZERO_BN } from '../../config/constants'

interface RouteParams {
  condition: string
}

interface Form {
  conditionId: Maybe<string>
  colateral: Maybe<Token>
  amount: BigNumber
}

const bytesRegex = /^0x[a-fA-F0-9]{64}$/

export const SplitCondition = (props: RouteComponentProps<RouteParams>) => {
  const {
    register,
    errors,
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<Form>()

  const { CTService, signer, networkConfig } = useWeb3Connected()
  const tokens = networkConfig.getTokens()

  const [conditionId, setConditionId] = useState<string>(props.match.params.condition || '')
  const [collateral, setCollateral] = useState<Maybe<Token>>(null)
  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const [outcomeSlot, setOutcomeSlot] = useState(0)
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useAllowance(signer, collateral)

  const onSubmit = async (data: any) => {
    const partition = Array.from({ length: outcomeSlot }, (_, i) => i).reduce(
      (acc: BigNumber[], _, index: number) => {
        const two = new BigNumber(2)
        acc.push(two.pow(index))
        return acc
      },
      []
    )

    if (collateral) {
      await CTService.splitPosition(
        collateral.address,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        conditionId,
        partition,
        data.amount
      )
    }
  }

  const unlockCollateral = async () => {
    await unlock()
    setAllowanceFinished(true)
  }

  useEffect(() => {
    const getOutcomeSlot = async (conditionId: string) => {
      const outcomesSlot = await CTService.getOutcomeSlotCount(conditionId)
      setOutcomeSlot(outcomesSlot)
    }
    // TODO add isValid again
    if (conditionId) {
      getOutcomeSlot(conditionId)
    }
  }, [isValid, conditionId, CTService])

  const allowanceBN = allowance.get() || ZERO_BN
  const hasEnoughAllowance = allowanceBN && allowanceBN.gte(amount)
  const hasZeroAllowance = allowanceBN && allowanceBN.isZero()

  const showAskAllowance = allowanceFinished && (hasEnoughAllowance === false || hasZeroAllowance)
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="conditionId">Condition Id</label>
      {/* Select Condition */}
      <input
        name="conditionId"
        value={conditionId}
        onChange={(e) => setConditionId(e.target.value)}
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
          <p>{errors.conditionId.type === 'validate' && "Condition doesn't exists"}</p>
        </div>
      )}

      <label htmlFor="collateral">Collateral</label>
      <select
        ref={register({ required: true })}
        name="collateral"
        onChange={(e) => setCollateral(tokens.find((t) => t.address === e.target.value) || null)}
      >
        <option value={undefined}></option>
        {tokens.map(({ symbol, address }) => {
          return (
            <option key={address} value={address}>
              {symbol}
            </option>
          )
        })}
      </select>

      {showAskAllowance && collateral && (
        <SetAllowance
          collateral={collateral}
          loading={allowance.isLoading()}
          finished={allowanceFinished}
          onUnlock={unlockCollateral}
        />
      )}

      <label htmlFor="amount">Amount</label>
      {collateral && (
        <Controller
          name="amount"
          rules={{ required: true }}
          control={control}
          as={
            <BigNumberInputWrapper
              value={amount}
              onChange={(e) => {
                setAmount(e)
              }}
              decimals={collateral.decimals}
            />
          }
        />
      )}
      <button type="submit">Split</button>
    </form>
  )
}
