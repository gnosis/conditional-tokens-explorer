import { getLogger } from 'util/logger'
import { arePositionMergeables, isConditionFullIndexSet, minBigNumber } from 'util/tools'

import { Button } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { StripedList, StripedListItem } from 'components/common/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { ZERO_BN } from 'config/constants'
import { getTokenFromAddress } from 'config/networkConfig'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Row } from '../../components/pureStyledComponents/Row'

import { Amount } from './Amount'
import { MergePreview } from './MergePreview'
import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const {
    networkConfig: { networkId },
  } = useWeb3Connected()

  const { balances, positions } = useMultiPositionsContext()

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()

  const isFullIndexSet = useMemo(() => {
    return condition && isConditionFullIndexSet(positions, condition)
  }, [positions, condition])

  const collateralToken = useMemo(() => {
    if (positions.length && isFullIndexSet) {
      return getTokenFromAddress(networkId, positions[0].collateralToken.id)
    }
    return null
  }, [positions, networkId, isFullIndexSet])

  const maxBalance = useMemo(() => (isFullIndexSet ? minBigNumber(balances) : ZERO_BN), [
    balances,
    isFullIndexSet,
  ])

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const amountChangeHandler = useCallback(
    (value: BigNumber) => {
      if (isFullIndexSet && maxBalance.gte(value)) {
        setAmount(value)
      }
    },
    [maxBalance, isFullIndexSet]
  )
  const useWalletHandler = useCallback(() => {
    if (isFullIndexSet && maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance, isFullIndexSet])

  const decimals = useMemo(() => (collateralToken ? collateralToken.decimals : 0), [
    collateralToken,
  ])

  const disabled = useMemo(() => !isFullIndexSet || amount.isZero(), [isFullIndexSet, amount])

  return (
    <CenteredCard>
      <SelectPosition />
      <SelectCondition />
      <Amount
        amount={amount}
        balance={maxBalance}
        decimals={decimals}
        disabled={!isFullIndexSet}
        onAmountChange={amountChangeHandler}
        onUseWalletBalance={useWalletHandler}
      />
      <MergePreview amount={amount} />
      <ButtonWrapper>
        <Button disabled={disabled}>Merge</Button>
      </ButtonWrapper>
    </CenteredCard>
  )
}

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 80px;
`
