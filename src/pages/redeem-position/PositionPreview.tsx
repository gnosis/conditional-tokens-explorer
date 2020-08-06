import React from 'react'

import { getTokenFromAddress } from '../../config/networkConfig'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'
import { formatBigNumber } from '../../util/tools'

interface Props {
  positionId: string
  collateralTokenAddress: string
  networkId: number
}

export const PositionPreview = ({ collateralTokenAddress, networkId, positionId }: Props) => {
  const { balance } = useBalanceForPosition(positionId)
  const [decimals, setDecimals] = React.useState(18)

  React.useEffect(() => {
    if (networkId && collateralTokenAddress) {
      const { decimals } = getTokenFromAddress(networkId, collateralTokenAddress)
      setDecimals(decimals)
    }
  }, [networkId, collateralTokenAddress])

  return (
    <>
      <label>Redeemed position preview </label>
      <span>{formatBigNumber(balance, decimals)}</span>
    </>
  )
}
