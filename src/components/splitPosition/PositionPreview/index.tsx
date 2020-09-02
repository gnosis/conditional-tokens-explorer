import { positionString, trivialPartition } from 'util/tools'
import { SplitFromType, Token } from 'util/types'

import { StripedList, StripedListItem } from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { BigNumber } from 'ethers/utils'
import { useCollateral } from 'hooks/useCollateral'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { GetPosition_position } from 'types/generatedGQL'

interface Props {
  splitFrom: SplitFromType
  conditionId: string
  outcomeSlotCount: number
  selectedCollateral: Token
  position: Maybe<GetPosition_position>
  amount: BigNumber
}

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

export const PositionPreview = ({
  amount,
  conditionId,
  outcomeSlotCount,
  position,
  selectedCollateral,
  splitFrom,
}: Props) => {
  const positionCollateral = useCollateral(position ? position.collateralToken.id : '')

  const splitFromCollateral = useMemo(() => splitFrom === SplitFromType.collateral, [splitFrom])
  const splitFromPosition = useMemo(() => splitFrom === SplitFromType.position, [splitFrom])

  const splitPositionPreview = useMemo(() => {
    if (!conditionId || (splitFromPosition && (!position || !positionCollateral))) {
      return []
    }

    if (splitFromCollateral) {
      return trivialPartition(outcomeSlotCount).map((indexSet) => {
        return positionString([conditionId], [indexSet], amount, selectedCollateral)
      })
    }

    if (position && positionCollateral) {
      return trivialPartition(outcomeSlotCount).map((indexSet) => {
        return positionString(
          [...position.conditionIds, conditionId],
          [...[position.indexSets], indexSet],
          amount,
          positionCollateral
        )
      })
    }
    return []
  }, [
    conditionId,
    position,
    outcomeSlotCount,
    amount,
    selectedCollateral,
    splitFromPosition,
    splitFromCollateral,
    positionCollateral,
  ])

  return (
    <TitleValue
      title="Split Position Preview"
      value={
        <StripedListStyled>
          {splitPositionPreview.map((preview, i) => (
            <StripedListItem key={`preview-${i}`}>{preview}</StripedListItem>
          ))}
        </StripedListStyled>
      }
    />
  )
}
