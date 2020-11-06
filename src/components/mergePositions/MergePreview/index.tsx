import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItemPreview,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useCondition } from 'hooks/useCondition'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { getMergePreview } from 'util/tools'
import { Token } from 'util/types'

interface Props {
  amount: BigNumber
  token: Maybe<Token>
  positions: Array<PositionWithUserBalanceWithDecimals>
  conditionId: Maybe<string>
}

export const MergePreview = ({ amount, conditionId, positions, token }: Props) => {
  const condition = useCondition(conditionId)

  const preview = useMemo(() => {
    if (condition && conditionId && token) {
      return getMergePreview(positions, conditionId, amount, token, condition.outcomeSlotCount)
    }
    return null
  }, [positions, condition, conditionId, amount, token])

  return (
    <TitleValue
      title="Merged Positions Preview"
      value={
        <StripedList maxHeight="none" minHeight="41px">
          {preview ? (
            <StripedListItemPreview>{preview}</StripedListItemPreview>
          ) : (
            <StripedListEmpty>No merged positions yet.</StripedListEmpty>
          )}
        </StripedList>
      }
    />
  )
}
