import { BigNumber } from 'ethers/utils'
import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'

export const useBalanceForPosition = (positionId: string, refresh?: string) => {
  const { CTService } = useWeb3ConnectedOrInfura()

  const [balance, setBalance] = React.useState<BigNumber>(new BigNumber(0))
  const [error, setError] = React.useState<Maybe<string>>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    setLoading(true)

    const getBalance = async () => {
      try {
        const balance = await CTService.balanceOf(positionId)
        setBalance(balance)
      } catch (err) {
        setError(err)
      }
    }

    getBalance()

    setLoading(false)
  }, [CTService, positionId, setBalance, setError, setLoading, refresh])

  return {
    balance,
    error,
    loading,
  }
}
