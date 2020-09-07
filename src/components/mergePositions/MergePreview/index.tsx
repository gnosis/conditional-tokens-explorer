import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { arePositionMergeablesByCondition, getMergePreview } from 'util/tools'

interface Props {
  amount: BigNumber
}

export const MergePreview = ({ amount }: Props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

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
