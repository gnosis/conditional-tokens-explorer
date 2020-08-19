import { getMergePreview, isConditionFullIndexSet } from 'util/tools'

import { Row } from 'components/pureStyledComponents/Row'
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
import { position } from 'polished'
import React, { useMemo } from 'react'

interface Props {
  amount: BigNumber
}

export const MergePreview = ({ amount }: Props) => {
  const {
    networkConfig: { networkId },
  } = useWeb3Connected()

  const { positions } = useMultiPositionsContext()
  const { condition } = useConditionContext()

  const isFullIndexSet = useMemo(() => {
    return condition && isConditionFullIndexSet(positions, condition)
  }, [positions, condition])

  const mergedPosition = useMemo(
    () =>
      isFullIndexSet && condition && position.length
        ? getMergePreview(positions, condition, amount, networkId)
        : '',
    [isFullIndexSet, condition, positions, amount, networkId]
  )

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
