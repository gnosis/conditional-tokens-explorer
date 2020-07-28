import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers/utils'

import { useWeb3Connected } from '../contexts/Web3Context'

export const useBalanceForPosition = (position: string) => {
  const { CTService } = useWeb3Connected()

  const [balance, setBalance] = useState<BigNumber>(new BigNumber(0))
  const [error, setError] = useState<Maybe<string>>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
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
