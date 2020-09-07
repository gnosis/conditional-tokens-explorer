import { BigNumber } from 'ethers/utils'
import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'

export const useBalanceForPosition = (position: string) => {
  const { CTService } = useWeb3ConnectedOrInfura()

  const [balance, setBalance] = React.useState<BigNumber>(new BigNumber(0))
  const [error, setError] = React.useState<Maybe<string>>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    setLoading(true)

    const getBalance = async (position: string) => {
      try {
        const balance = await CTService.balanceOf(position)
        setBalance(balance)
      } catch (err) {
        setError(err)
      }
    }

    getBalance(position)

    setLoading(false)
  }, [CTService, position, setBalance, setError, setLoading])

  return {
    balance,
    error,
    loading,
  }
}
