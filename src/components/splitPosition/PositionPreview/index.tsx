import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useCollateral } from 'hooks/useCollateral'
import { GetPosition_position } from 'types/generatedGQL'
import { positionString, trivialPartition } from 'util/tools'
import { SplitFromType, Token } from 'util/types'

interface Props {
  amount: BigNumber
  conditionId: string
  outcomeSlotCount: number
  position: Maybe<GetPosition_position>
  selectedCollateral: Token
  splitFrom: SplitFromType
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
    amount,
    conditionId,
    outcomeSlotCount,
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
              <StripedListItem key={`preview-${i}`}>{preview}</StripedListItem>
            ))
          ) : (
            <StripedListEmpty>No Split Positions.</StripedListEmpty>
          )}
        </StripedListStyled>
      }
    />
  )
}
