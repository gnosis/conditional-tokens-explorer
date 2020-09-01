import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { useWeb3ConnectedOrInfura } from '../contexts/Web3Context'
import { getLogger } from '../util/logger'

const logger = getLogger('UseBalanceForBatchPosition')

export const useBalanceForBatchPosition = (positionIds: Array<string>) => {
  const { CTService } = useWeb3ConnectedOrInfura()

  const [balances, setBalances] = useState<Array<BigNumber>>([])
  const [error, setError] = useState<Maybe<string>>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const getBalance = async (positionIds: Array<string>) => {
      try {
        setLoading(true)
        if (positionIds.length > 0) {
          const balances = await CTService.balanceOfBatch(positionIds)
          setBalances(balances)
        } else {
          setBalances([])
        }
      } catch (err) {
        logger.error(err)
        setBalances([])
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    getBalance(positionIds)
  }, [CTService, positionIds, setBalances, setError, setLoading])

  return {
    balances,
    error,
    loading,
  }
}
