import { getLogger } from 'util/logger'
import { isConditionFullIndexSet, minBigNumber } from 'util/tools'
import { Status } from 'util/types'

import { Button } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { ZERO_BN } from 'config/constants'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'
import styled from 'styled-components'

import { Amount } from './Amount'
import { MergePreview } from './MergePreview'
import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('MergePosition')

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 80px;
`

export const Contents = () => {
  const { CTService, networkConfig } = useWeb3Connected()

  const {
    balances,
    clearPositions,
    errors: positionsErrors,
    positions,
  } = useMultiPositionsContext()
  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const [status, setStatus] = React.useState<Maybe<Status>>(null)

  const isFullIndexSet = useMemo(() => {
    return condition && isConditionFullIndexSet(positions, condition)
  }, [positions, condition])

  const collateralToken = useMemo(() => {
    if (positions.length && isFullIndexSet) {
      return networkConfig.getTokenFromAddress(positions[0].collateralToken.id)
    }
    return null
  }, [positions, networkConfig, isFullIndexSet])

  const maxBalance = useMemo(
    () => (isFullIndexSet && balances.length ? minBigNumber(balances) : ZERO_BN),
    [balances, isFullIndexSet]
  )

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const amountChangeHandler = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])
  const useWalletHandler = useCallback(() => {
    if (isFullIndexSet && maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance, isFullIndexSet])

  const decimals = useMemo(() => (collateralToken ? collateralToken.decimals : 0), [
    collateralToken,
  ])

  const disabled = useMemo(
    () =>
      status === Status.Loading ||
      positionsErrors.length > 0 ||
      conditionErrors.length > 0 ||
      !isFullIndexSet ||
      amount.isZero(),
    [isFullIndexSet, amount, status, positionsErrors, conditionErrors]
  )

  const onMerge = useCallback(async () => {
    try {
      if (positions && condition) {
        setStatus(Status.Loading)

        const { collateralToken, conditionIds, indexSets } = positions[0]
        const newCollectionsSet = conditionIds.reduce(
          (acc, conditionId, i) =>
            conditionId !== condition.id
              ? [...acc, { conditionId, indexSet: new BigNumber(indexSets[i]) }]
              : acc,
          new Array<{ conditionId: string; indexSet: BigNumber }>()
        )
        const parentCollectionId = newCollectionsSet.length
          ? ConditionalTokensService.getConbinedCollectionId(newCollectionsSet)
          : ethers.constants.HashZero

        // It shouldn't be able to call onMerge if positions were not mergeables, so no -1 for findIndex.
        const partition = positions.map(
          ({ conditionIds, indexSets }) =>
            indexSets[conditionIds.findIndex((conditionId) => conditionId === condition.id)]
        )

        await CTService.mergePositions(
          collateralToken.id,
          parentCollectionId,
          condition.id,
          partition,
          amount
        )

        setAmount(ZERO_BN)
        clearPositions()
        clearCondition()

        setStatus(Status.Ready)
      }
    } catch (err) {
      setStatus(Status.Error)
      logger.error(err)
    }
  }, [positions, condition, CTService, amount, clearPositions, clearCondition])

  return (
    <CenteredCard>
      <SelectPosition />
      <SelectCondition />
      <Amount
        amount={amount}
        balance={maxBalance}
        decimals={decimals}
        disabled={!isFullIndexSet}
        max={maxBalance.toString()}
        onAmountChange={amountChangeHandler}
        onUseWalletBalance={useWalletHandler}
      />
      <MergePreview amount={amount} />
      <ButtonWrapper>
        <Button disabled={disabled} onClick={onMerge}>
          Merge
        </Button>
      </ButtonWrapper>
    </CenteredCard>
  )
}
