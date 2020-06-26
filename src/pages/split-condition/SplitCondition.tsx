import React, { useState, useEffect } from 'react'
import { BigNumber } from 'ethers/utils'
import { useForm, Controller } from 'react-hook-form'
import { Token } from '../../config/networkConfig'
import { SetAllowance } from '../../components/common/SetAllowance'
import { BigNumberInputWrapper } from '../../components/common/BigNumberInputWrapper'
import { ZERO_BN } from '../../config/constants'
import { trivialPartition } from '../../util/tools'
import { Remote } from '../../util/remoteData'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { useQuery } from '@apollo/react-hooks'
import { fetchPosition as FetchPosition, fetchPositionVariables } from 'types/generatedGQL'
import { fetchPosition } from 'queries/positions'

const bytesRegex = /^0x[a-fA-F0-9]{64}$/
const NULL_PARENT_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'

type SplitFrom = 'collateral' | 'position'

type Form = {
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
    conditionId: string,
    parentCollection: string,
    partition: BigNumber[],
    amount: BigNumber
  ) => void
  hasUnlockedCollateral: boolean
  tokens: Token[]
  ctService: ConditionalTokensService
}

export const SplitCondition = ({
  allowance,
  unlockCollateral,
  onCollateralChange,
  hasUnlockedCollateral,
  splitPosition,
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
    setError,
    formState: { isValid },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      conditionId: '',
      collateral: tokens[0].address,
      amount: ZERO_BN,
      splitFrom: 'collateral',
      positionId: '',
    },
  })

  const [outcomeSlot, setOutcomeSlot] = useState(0)
  const [collateralToken, setCollateralToken] = useState(tokens[0])
  const [balance, setBalance] = useState<BigNumber>(ZERO_BN)
  const { amount, collateral, conditionId, splitFrom, positionId } = getValues() as Form

  watch('collateral')
  watch('splitFrom')

  const splitFromCollateral = splitFrom === 'collateral'
  const splitFromPosition = splitFrom === 'position'

  const onSubmit = async () => {
    const partition = trivialPartition(outcomeSlot)

    if (splitFromCollateral) {
      splitPosition(collateral, conditionId, NULL_PARENT_ID, partition, amount)
    }
    if (splitFromPosition && fetchedPosition?.position) {
      const {
        collection: { id: collectionId },
        collateralToken: { id: collateralAddress },
      } = fetchedPosition?.position
      splitPosition(collateralAddress, conditionId, collectionId, partition, amount)
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

  const skipFetchPosition = positionId === '' || !splitFromPosition || !!errors.positionId
  const { data: fetchedPosition, loading, error: errorFetchingPosition } = useQuery<
    FetchPosition,
    fetchPositionVariables
  >(fetchPosition, {
    variables: { id: positionId },
    skip: skipFetchPosition,
  })

  useEffect(() => {
    if (splitFromCollateral) {
      const collateralToken = tokens.find((t) => t.address === collateral) || tokens[0]
      setCollateralToken(collateralToken)
      onCollateralChange(collateral)
    }
  }, [splitFrom, onCollateralChange, tokens, collateral, splitFromCollateral])

  useEffect(() => {
    if (splitFromPosition && positionId && fetchedPosition?.position) {
      onCollateralChange(collateral)
      ctService.balanceOf(positionId).then((value) => {
        setBalance(value)
      })
    } else if (errorFetchingPosition) {
      setError('positionId', 'validate', 'Error fetching position')
    }
  }, [
    splitFrom,
    onCollateralChange,
    positionId,
    fetchedPosition,
    splitFromPosition,
    errorFetchingPosition,
    collateral,
    ctService,
    setError,
  ])

  const hasEnoughAllowance = allowance.map(
    (allowance) => allowance.gte(amount) && !allowance.isZero()
  )

  // We show the allowance component if we know the user doesn't have enough allowance
  const showAskAllowance =
    (hasEnoughAllowance.hasData() && !hasEnoughAllowance.get()) ||
    hasUnlockedCollateral ||
    allowance.isLoading()

  const canSubmit =
    isValid && (hasEnoughAllowance.getOr(false) || hasUnlockedCollateral) && !loading

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="conditionId">Condition Id</label>
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
      </div>
      <div>
        <label htmlFor="collateral">Collateral</label>
        <input name="splitFrom" type="radio" value="collateral" ref={register} />
        <select
          ref={register({ required: splitFromCollateral })}
          name="collateral"
          disabled={!splitFromCollateral}
        >
          {tokens.map(({ symbol, address }) => {
            return (
              <option key={address} value={address}>
                {symbol}
              </option>
            )
          })}
        </select>
      </div>
      <div>
        <label>Position</label>
        <input
          name="splitFrom"
          id="splitFrom-position"
          type="radio"
          value="position"
          ref={register}
        />
        <input
          name="positionId"
          type="text"
          disabled={!splitFromPosition}
          ref={register({
            required: splitFromPosition,
            pattern: bytesRegex,
          })}
        ></input>
        {errors.positionId && (
          <div>
            <p>{errors.positionId.type === 'pattern' && 'Invalid bytes32 string'}</p>
            <p>
              {errors.positionId.type === 'validate' &&
                !skipFetchPosition &&
                !loading &&
                fetchedPosition?.position === null &&
                'Invalid'}
            </p>
          </div>
        )}
      </div>
      {showAskAllowance && (
        <SetAllowance
          collateral={collateralToken}
          loading={allowance.isLoading()}
          finished={hasUnlockedCollateral && hasEnoughAllowance.getOr(false)}
          onUnlock={unlockCollateral}
        />
      )}
      <label htmlFor="amount">Amount</label>
      {splitFrom === 'position' && (
        <a onClick={() => setValue('amount', balance)}>{`Wallet Balance ${balance.toString()}`}</a>
      )}
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
