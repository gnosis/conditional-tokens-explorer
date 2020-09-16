import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { arePositionMergeablesByCondition, getMergePreview, getTokenSummary } from 'util/tools'

interface Props {
  amount: BigNumber
}

export const MergePreview = ({ amount }: Props) => {
  const { networkConfig, provider } = useWeb3ConnectedOrInfura()

  const { positions } = useMultiPositionsContext()
  const { condition } = useConditionContext()
  const [mergedPosition, setMergedPosition] = useState('')

  const canMergePositions = useMemo(() => {
    return condition && arePositionMergeablesByCondition(positions, condition)
  }, [positions, condition])

  useEffect(() => {
    let cancelled = false
    if (canMergePositions && condition && positions.length > 0) {
      getTokenSummary(networkConfig, provider, positions[0].collateralToken.id).then((token) => {
        if (!cancelled) {
          setMergedPosition(getMergePreview(positions, condition, amount, token))
        }
      })
    } else {
      setMergedPosition('')
    }
    return () => {
      cancelled = true
    }
  }, [canMergePositions, condition, positions, amount, provider, networkConfig])

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
