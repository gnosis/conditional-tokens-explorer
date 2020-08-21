import {
  arePositionMergeablesByCondition,
  getMergePreview,
  isConditionFullIndexSet,
} from 'util/tools'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

interface Props {
  amount: BigNumber
}

export const MergePreview = ({ amount }: Props) => {
  const { networkConfig } = useWeb3Connected()

  const { positions } = useMultiPositionsContext()
  const { condition } = useConditionContext()

  const canMergePositions = useMemo(() => {
    return condition && arePositionMergeablesByCondition(positions, condition)
  }, [positions, condition])

  const mergedPosition = useMemo(() => {
    if (canMergePositions && condition && positions.length > 0) {
      const token = networkConfig.getTokenFromAddress(positions[0].collateralToken.id)
      return getMergePreview(positions, condition, amount, token)
    }
    return ''
  }, [canMergePositions, condition, positions, amount, networkConfig])

  return (
    <TitleValue
      title="Merged Positions Preview"
      value={
        <StripedList maxHeight="41px">
          {mergedPosition ? (
            <StripedListItem>
              <strong>{mergedPosition}</strong>
            </StripedListItem>
          ) : (
            <StripedListEmpty>No merged positions yet.</StripedListEmpty>
          )}
        </StripedList>
      }
    />
  )
}
