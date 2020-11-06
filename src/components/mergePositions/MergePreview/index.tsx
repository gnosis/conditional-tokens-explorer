import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItemPreview,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { getMergePreview } from 'util/tools'
import { Token } from 'util/types'
import { GetCondition_condition } from 'types/generatedGQLForCTE'

interface Props {
  amount: BigNumber
  token: Maybe<Token>
  positions: Array<PositionWithUserBalanceWithDecimals>
  condition: Maybe<GetCondition_condition>
}

export const MergePreview = ({ amount, condition, positions, token }: Props) => {
  const preview = useMemo(() => {
    if (condition && token) {
      return getMergePreview(positions, condition.id, amount, token, condition.outcomeSlotCount)
    }
    return null
  }, [positions, condition, amount, token])

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
