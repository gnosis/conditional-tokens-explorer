import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { GetCondition_condition, GetPosition_position } from 'types/generatedGQL'

import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'
import { getRedeemedBalance, getRedeemedPreview } from '../../util/tools'

interface Props {
  position: Maybe<GetPosition_position>
  condition: Maybe<GetCondition_condition>
  networkId: number
}

export const PositionPreview = ({ condition, networkId, position }: Props) => {
  const { balance } = useBalanceForPosition(position?.id || '')

  const redeemedBalance = useMemo(
    () =>
      position && condition ? getRedeemedBalance(position, condition, balance) : new BigNumber(0),
    [position, condition, balance]
  )
  const redeemedPreview = useMemo(
    () =>
      position && condition && networkId
        ? getRedeemedPreview(position, condition, redeemedBalance, networkId)
        : '',
    [position, condition, redeemedBalance, networkId]
  )

  return (
    <>
      <label>Redeemed position preview </label>
      <span>{redeemedPreview}</span>
    </>
  )
}
