import { BigNumber } from 'ethers/utils'
import React, { useMemo } from 'react'

import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { NetworkConfig } from 'config/networkConfig'
import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { GetCondition_condition, GetPosition_position } from 'types/generatedGQL'
import { getRedeemedBalance, getRedeemedPreview } from 'util/tools'

interface Props {
  position: Maybe<GetPosition_position>
  condition: Maybe<GetCondition_condition>
  networkConfig: NetworkConfig
}

export const PositionPreview = ({ condition, networkConfig, position }: Props) => {
  const { balance } = useBalanceForPosition(position?.id || '')

  const redeemedBalance = useMemo(
    () =>
      position && condition ? getRedeemedBalance(position, condition, balance) : new BigNumber(0),
    [position, condition, balance]
  )

  const redeemedPreview = useMemo(() => {
    if (position && condition) {
      const token = networkConfig.getTokenFromAddress(position.collateralToken.id)
      return getRedeemedPreview(position, condition, redeemedBalance, token)
    }
    return ''
  }, [position, condition, redeemedBalance, networkConfig])

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
