import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
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
        <StripedList maxHeight="41px">
          {preview ? (
            <StripedListItem>
              <strong>{preview}</strong>
            </StripedListItem>
          ) : (
            <StripedListEmpty>No merged positions.</StripedListEmpty>
          )}
        </StripedList>
      }
    />
  )
}
