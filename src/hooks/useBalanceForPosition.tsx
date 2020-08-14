import { BigNumber } from 'ethers/utils'
import React from 'react'

import { Web3ContextStatus, useWeb3Context } from '../contexts/Web3Context'

export const useBalanceForPosition = (position: string) => {
  const { status } = useWeb3Context()

  const [balance, setBalance] = React.useState<BigNumber>(new BigNumber(0))
  const [error, setError] = React.useState<Maybe<string>>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    setLoading(true)

    const getBalance = async (position: string) => {
      try {
        if (
          status._type === Web3ContextStatus.Infura ||
          status._type === Web3ContextStatus.Connected
        ) {
          const { CTService } = status
          const balance = await CTService.balanceOf(position)
          setBalance(balance)
        }
      } catch (err) {
        setError(err)
      }
    }

    getBalance(position)

    setLoading(false)
  }, [status, position, setBalance, setError, setLoading])

  return {
    balance,
    error,
    loading,
  }
}
