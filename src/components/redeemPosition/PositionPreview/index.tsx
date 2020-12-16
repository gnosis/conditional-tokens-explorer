import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { SpinnerSize } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import { NetworkConfig } from 'config/networkConfig'
import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { useCollateral } from 'hooks/useCollateral'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import { getRedeemedBalance, getRedeemedPreview } from 'util/tools'

interface Props {
  position: Maybe<PositionWithUserBalanceWithDecimals>
  condition: Maybe<GetCondition_condition>
  networkConfig: NetworkConfig
  isLoading: boolean
}

export const PositionPreview = (props: Props) => {
  const { condition, isLoading, position } = props
  const { balanceERC1155, loading, refetch } = useBalanceForPosition(position?.id || '')
  const { collateral: token } = useCollateral(position ? position.collateralToken : '')

  useEffect(() => {
    if (position) {
      refetch()
    }
  }, [position, refetch])

  const redeemedBalance = useMemo(
    () =>
      position && condition
        ? getRedeemedBalance(position, condition, balanceERC1155)
        : new BigNumber(0),
    [balanceERC1155, condition, position]
  )

  const redeemedPreview = useMemo(() => {
    if (position && condition && token) {
      return getRedeemedPreview(position, condition.id, redeemedBalance, token)
    }
    return ''
  }, [position, condition, token, redeemedBalance])

  return (
    <TitleValue
      title="Redeemed Position Preview"
      value={
        <StripedList>
          {(isLoading || loading) ? (
            <InlineLoading size={SpinnerSize.small} />
          ) : redeemedPreview ? (
            <StripedListItem>
              <strong>{redeemedPreview}</strong>
            </StripedListItem>
          ) : (
            <StripedListEmpty>No redeemed position.</StripedListEmpty>
          )}
        </StripedList>
      }
    />
  )
}
