import { getMergePreview, isConditionFullIndexSet } from 'util/tools'

import { StripedList, StripedListItem } from 'components/common/StripedList'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import { position } from 'polished'
import React, { useMemo, useState } from 'react'
import { GetMultiPositions_positions } from 'types/generatedGQL'

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
    <Row cols={'1fr'} marginBottomXL>
      <TitleValue
        title="Merged position preview"
        value={
          <StripedList>
            <StripedListItem>{mergedPosition}</StripedListItem>
          </StripedList>
        }
      />
    </Row>
  )
}
