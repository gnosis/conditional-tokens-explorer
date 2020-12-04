import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItemPreview,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import { getMergePreview } from 'util/tools'
import { Token } from 'util/types'

interface Props {
  amount: BigNumber
  token: Maybe<Token>
  positions: Array<PositionWithUserBalanceWithDecimals>
  condition: Maybe<GetCondition_condition>
}

export const MergePreview = ({ amount, condition, positions, token }: Props) => {
  const preview = useMemo(() => {
    if (condition && token && positions.length > 0) {
      return getMergePreview(positions, condition.id, amount, token, condition.outcomeSlotCount)
    }
    return null
  }, [positions, condition, amount, token])

  return (
    <TitleValue
      title="Merged Positions Preview"
      value={
        <StripedList>
          {preview ? (
            <StripedListItemPreview>{preview}</StripedListItemPreview>
          ) : (
            <StripedListEmpty>No merged positions.</StripedListEmpty>
          )}
        </StripedList>
      }
    />
  )
}
