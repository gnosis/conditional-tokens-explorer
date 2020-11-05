import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { NetworkConfig } from 'config/networkConfig'
import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { useCollateral } from 'hooks/useCollateral'
import { GetCondition_condition, GetPosition_position } from 'types/generatedGQLForCTE'
import { getRedeemedBalance, getRedeemedPreview } from 'util/tools'

interface Props {
  position: Maybe<GetPosition_position>
  condition: Maybe<GetCondition_condition>
  networkConfig: NetworkConfig
}

export const PositionPreview = ({ condition, position }: Props) => {
  const { balanceERC1155, refetch } = useBalanceForPosition(position?.id || '')
  const { collateral: token } = useCollateral(position ? position.collateralToken.id : '')

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
    [position, condition, balanceERC1155]
  )

  const redeemedPreview = useMemo(() => {
    if (position && condition && token) {
      // TODO: until we refactor this section
      // return getRedeemedPreview(position, condition, redeemedBalance, token)
      return ''
    }
    return ''
  }, [position, condition, redeemedBalance, token])

  return (
    <TitleValue
      title="Redeemed Position Preview"
      value={
        <StripedList maxHeight={redeemedPreview ? 'auto' : '44px'}>
          {redeemedPreview ? (
            <StripedListItem>
              <strong>{redeemedPreview}</strong>
            </StripedListItem>
          ) : (
            <StripedListEmpty>No redeemed preview yet.</StripedListEmpty>
          )}
        </StripedList>
      }
    />
  )
}
