import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'

export const useActiveAddress = () => {
  const { address: walletAddress, cpkAddress, isUsingTheCPKAddress } = useWeb3ConnectedOrInfura()

  const activeAddress = React.useMemo(() => {
    return isUsingTheCPKAddress() ? cpkAddress : walletAddress
  }, [isUsingTheCPKAddress, cpkAddress, walletAddress])

  return activeAddress
}
