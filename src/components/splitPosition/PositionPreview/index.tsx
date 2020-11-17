import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import {
  StripedList,
  StripedListEmpty,
  StripedListItemPreview,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useCollateral } from 'hooks/useCollateral'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { positionString } from 'util/tools'
import { SplitFromType, Token } from 'util/types'

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

interface Props {
  amount: BigNumber
  conditionId: string
  partition: Maybe<BigNumber[]>
  position: Maybe<PositionWithUserBalanceWithDecimals>
  selectedCollateral: Token
  splitFrom: SplitFromType
}

export const PositionPreview = ({
  amount,
  conditionId,
  partition,
  position,
  selectedCollateral,
  splitFrom,
}: Props) => {
  const { collateral: positionCollateral } = useCollateral(position ? position.collateralToken : '')
  const splitFromCollateral = useMemo(() => splitFrom === SplitFromType.collateral, [splitFrom])
  const splitFromPosition = useMemo(() => splitFrom === SplitFromType.position, [splitFrom])

  const splitPositionPreview = useMemo(() => {
    if (!conditionId || (splitFromPosition && (!position || !positionCollateral))) {
      return []
    }

    if (splitFromCollateral && partition && partition.length > 0) {
      return partition.map((indexSet) => {
        return positionString([conditionId], [indexSet.toString()], amount, selectedCollateral)
      })
    }

    if (position && positionCollateral && partition && partition.length > 0) {
      return partition.map((indexSet) => {
        return positionString(
          [...position.conditionIds, conditionId],
          [...[position.indexSets].map((i) => i.toString()), indexSet.toString()],
          amount,
          positionCollateral
        )
      })
    }
    return []
  }, [
    amount,
    conditionId,
    partition,
    position,
    positionCollateral,
    selectedCollateral,
    splitFromCollateral,
    splitFromPosition,
  ])

  return (
    <TitleValue
      title="Split Position Preview"
      value={
        <StripedListStyled>
          {splitPositionPreview.length > 0 ? (
            splitPositionPreview.map((preview, i) => (
              <StripedListItemPreview key={`preview-${i}`}>{preview}</StripedListItemPreview>
            ))
          ) : (
            <StripedListEmpty>No Split Positions.</StripedListEmpty>
          )}
        </StripedListStyled>
      }
    />
  )
}
