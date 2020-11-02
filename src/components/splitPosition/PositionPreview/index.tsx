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
import { GetPosition_position } from 'types/generatedGQLForCTE'
import { positionString } from 'util/tools'
import { SplitFromType, Token } from 'util/types'

interface Props {
  amount: BigNumber
  conditionId: string
  partition: Maybe<BigNumber[]>
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
  partition,
  position,
  selectedCollateral,
  splitFrom,
}: Props) => {
  const { collateral: positionCollateral } = useCollateral(
    position ? position.collateralToken.id : ''
  )
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
